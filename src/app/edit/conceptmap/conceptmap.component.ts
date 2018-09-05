import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import * as go from "gojs";
import { VersionService, ModelService } from '../../_services/index.service';
import swal from 'sweetalert2';

declare var $ : any;
export var myDiagram: go.Diagram;

@Component({
  selector: 'conceptmap',
  templateUrl: 'conceptmap.component.html'
})

export class ConceptMapComponent implements AfterViewInit, OnDestroy {
  
  name = 'GoJS';

  @ViewChild('myDiagramDiv')
  element: ElementRef;

  constructor(private versionService:VersionService, modelService:ModelService){}

  ngAfterViewInit() {
    let conceptNodeTemplate, relationNodeTemplate, normalLinkTemplate, orLinkTemplate, mapTemplate, selectionAdornmentTemplate;
    const $ = go.GraphObject.make;  // for conciseness in defining templates

    // To simplify this code we define a function for creating a context menu button:
    function makeButton(text, action, visiblePredicate) {
        return $("ContextMenuButton",
            $(go.TextBlock, text),
                { click: action },
                // don't bother with binding GraphObject.visible if there's no predicate
                visiblePredicate ? new go.Binding("visible", "", function(o, e) { return o.diagram ? visiblePredicate(o, e) : false; }).ofObject() : {});
    }

    function addNode(e, obj) {
        var adornment = obj.part;
        var diagram = e.diagram;
        diagram.startTransaction("Add State");

        // get the node data for which the user clicked the button
        var fromNode = adornment.adornedPart;
        var fromData = fromNode.data;
        // create a new "State" data object, positioned off to the right of the adorned Node
        var newNode = (fromNode.category=="concept" || fromNode.category=="map")?
            {text: "New Relation", loc:"", category:"relation", error: ""}:
            {text: "New Concept", loc:"", category:"concept", error: ""};
        var p = fromNode.location.copy();
        p.x += 120;
        newNode.loc = go.Point.stringify(p);  // the "loc" property is a string, not a Point object
        
        // add the new node data to the model
        var model = diagram.model;
        model.addNodeData(newNode);

        // create a link data from the old node data to the new node data
        var nodeData = {
            from: model.getKeyForNodeData(fromData),  // or just: fromData.id
            to: model.getKeyForNodeData(newNode),
            category: "normal",
            error: ''
        };
        
        // and add the link data to the model
        model.addLinkData(nodeData);

        // select the new Node
        var newrelation = diagram.findNodeForData(newNode);
        diagram.select(newrelation);

        diagram.commitTransaction("Add State");

        // if the new node is off-screen, scroll the diagram to show the new node
        diagram.scrollToRect(newrelation.actualBounds);
    }

    function nodeInfo(d) {  // Tooltip info for a node data object
        let str;
        if(d.category == "relation"){
            str = "Relation " + d.text + "\n";
        }else if(d.category == "concept"){
            str = "Concept " + d.text + "\n";
        }
        if(d.group)
            str += "Member of " + d.group;
        else
            str += "Top-level";
        return str;
    }

    // Define the appearance and behavior for Links:
    function linkInfo(d) {  // Tooltip info for a link data object
        return "Link:\nfrom " + d.from + " to " + d.to;
    }

    // Define the appearance and behavior for Groups:
    function groupInfo(adornment) {  // takes the tooltip or context menu, not a group node data object
        let g = adornment.adornedPart;  // get the Group that the tooltip adorns
        let mems = g.memberParts.count;
        let links = 0;
        g.memberParts.each(function(part) {
            if (part instanceof go.Link) links++;
        });
        let relations = 0;
        g.memberParts.each(function(part) {
            if (part instanceof go.Node && part.category == "relation") relations++;
        });
        return "Group " + g.data.key + ": " + g.data.text + "\n" + mems + " members including: \nLinks: " + links + "\nRelations: " + relations + "\nConcepts: " + (mems-links-relations);
    }

    // Define the behavior for the Diagram background:
    function diagramInfo(model) {  // Tooltip info for the diagram's model
        return "Model:\n" + model.nodeDataArray.length + " nodes and " + model.linkDataArray.length + " links";
    }

    // this function is used to highlight a Group that the selection may be dropped into
    function highlightGroup(e, grp, show) {
        if (!grp) return;
        e.handled = true;
        if (show) {
            // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
            // instead depend on the DraggingTool.draggedParts or .copiedParts
            var tool = grp.diagram.toolManager.draggingTool;
            var map = tool.draggedParts || tool.copiedParts;  // this is a Map
            // now we can check to see if the Group will accept membership of the dragged Parts
            if (grp.canAddMembers(map.toKeySet())) {
            grp.isHighlighted = true;
            return;
            }
        }
        grp.isHighlighted = false;
    }

    // Upon a drop onto a Group, we try to add the selection as members of the Group.
    // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
    // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
    function finishDrop(e, grp) {
    var ok = (grp !== null
                ? grp.addMembers(grp.diagram.selection, true)
                : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
        if (!ok) e.diagram.currentTool.doCancel();
    }

    // this predicate is true if both nodes have the same color
    function validateLink(fromnode, fromport, tonode, toport) {
        if(fromnode.data.category == "relation"){
            if(tonode.data.category=="concept" || tonode.data.category=="map") return true;
            else return false;
        }else return tonode.data.category == "relation";
        
    }

    // a context menu is an Adornment with a bunch of buttons in them
    let partContextMenu =
        $(go.Adornment, "Vertical",
            makeButton("Properties",
                    function(e, obj) {  // OBJ is this Button
                        var contextmenu = obj.part;  // the Button is in the context menu Adornment
                        var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
                        // now can do something with PART, or with its data, or with the Adornment (the context menu)
                        if (part instanceof go.Link) alert(linkInfo(part.data));
                        else if (part instanceof go.Group) alert(groupInfo(contextmenu));
                        else alert(nodeInfo(part.data));
                    }, undefined ),
            makeButton("Cut",
                    function(e, obj) { e.diagram.commandHandler.cutSelection(); },
                    function(o) { return o.diagram.commandHandler.canCutSelection(); }),
            makeButton("Copy",
                    function(e, obj) { e.diagram.commandHandler.copySelection(); },
                    function(o) { return o.diagram.commandHandler.canCopySelection(); }),
            makeButton("Paste",
                    function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
                    function(o) { return o.diagram.commandHandler.canPasteSelection(); }),
            makeButton("Delete",
                    function(e, obj) { e.diagram.commandHandler.deleteSelection(); },
                    function(o) { return o.diagram.commandHandler.canDeleteSelection(); }),
            makeButton("Undo",
                    function(e, obj) { e.diagram.commandHandler.undo(); },
                    function(o) { return o.diagram.commandHandler.canUndo(); }),
            makeButton("Redo",
                    function(e, obj) { e.diagram.commandHandler.redo(); },
                    function(o) { return o.diagram.commandHandler.canRedo(); }),
            makeButton("Group",
                    function(e, obj) { e.diagram.commandHandler.groupSelection(); },
                    function(o) { return o.diagram.commandHandler.canGroupSelection(); }),
            makeButton("Ungroup",
                    function(e, obj) { e.diagram.commandHandler.ungroupSelection(); },
                    function(o) { return o.diagram.commandHandler.canUngroupSelection(); })
        );
    myDiagram = 
        $(go.Diagram, this.element.nativeElement, // create a Diagram for the DIV HTML element
        {
            allowDrop: true, // from Palette
            // what to do when a drag-drop occurs in the Diagram's background
            mouseDrop: function(e) { finishDrop(e, null); },
            initialContentAlignment: go.Spot.Center, // center the content
            "undoManager.isEnabled": true,  // enable undo (CTRL+Z) & redo (CTRL+Y)
            "clickCreatingTool.archetypeNodeData": { text: "New Concept", category: "concept" }, // allow double-click in background to create a new node
            "linkingTool.archetypeLinkData": {category: "normal"},
            "commandHandler.archetypeGroupData": { text: "New Map", isGroup: true, color: "blue", category: "map" },//ctrl+G to group
            
        }
    );

    // provide a tooltip for the background of the Diagram, when not over any Part
    myDiagram.toolTip =
        $(go.Adornment, "Auto",
            $(go.Shape, 
                { 
                    fill: "#FFFFCC" 
                }
            ),
            $(go.TextBlock, 
                { 
                    margin: 4 
                },
                new go.Binding("text", "", diagramInfo)
            )
        );
    
    // provide a context menu for the background of the Diagram, when not over any Part
    myDiagram.contextMenu =
        $(go.Adornment, "Vertical",
            makeButton("Paste",
                        function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
                        function(o) { return o.diagram.commandHandler.canPasteSelection(); }),
            makeButton("Undo",
                        function(e, obj) { e.diagram.commandHandler.undo(); },
                        function(o) { return o.diagram.commandHandler.canUndo(); }),
            makeButton("Redo",
                        function(e, obj) { e.diagram.commandHandler.redo(); },
                        function(o) { return o.diagram.commandHandler.canRedo(); })
        );

    conceptNodeTemplate = 
        $(go.Node, "Auto",  // the Shape will go around the TextBlock
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, "Rectangle", 
            {
                portId: "", 
                strokeWidth: 1,
                fromLinkable: true, 
                fromLinkableSelfNode: true, 
                fromLinkableDuplicates: true,
                toLinkable: true, 
                toLinkableSelfNode: true, 
                toLinkableDuplicates: true,
                cursor: "pointer",
                fill: $(go.Brush, "Linear", {0: "rgb(254, 201, 0)", 1:"rgb(254, 162, 0)"}),
                stroke: "black"
            },
                // Shape.fill is bound to Node.data.color
                new go.Binding("fill", "color")
            ),
            $(go.TextBlock,
                {
                    font: "bold 12px sans-serif",
                    stroke: '#333',
                    margin: 6,  // make some extra space for the shape around the text
                    isMultiline: true,  // don't allow newlines in text
                    editable: true  // allow in-place editing by user
                },  // some room around the text
                // TextBlock.text is bound to Node.data.key
                new go.Binding("text", "text").makeTwoWay()
            ),
            { // this tooltip Adornment is shared by all nodes
                toolTip:
                    $(go.Adornment, "Auto",
                        $(go.Shape, { fill: "#FFFFCC" }),
                        $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                            new go.Binding("text", "", nodeInfo)
                        )
                    ),
                // this context menu Adornment is shared by all nodes
                contextMenu: partContextMenu
            }
    );

    relationNodeTemplate = 
        $(go.Node, "Auto",  // the Shape will go around the TextBlock
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, "Rectangle", 
            {
                portId: "", 
                strokeWidth: 1,
                fromLinkable: true, 
                fromLinkableSelfNode: true, 
                fromLinkableDuplicates: true,
                toLinkable: true, 
                toLinkableSelfNode: true, 
                toLinkableDuplicates: true,
                cursor: "pointer",
                fill: "rgba(255,255,255,0)",
                stroke: "rgba(255,255,255,0)"
            }, 
            new go.Binding("fill", "color")
                ),
            $(go.TextBlock,
                {
                    font: "bold 12px sans-serif",
                    stroke: '#333',
                    margin: 6,  // make some extra space for the shape around the text
                    isMultiline: true,  // don't allow newlines in text
                    editable: true
                },  // some room around the text
                // TextBlock.text is bound to Node.data.key
                new go.Binding("text", "text").makeTwoWay()
            ),
            { // this tooltip Adornment is shared by all nodes
                toolTip:
                    $(go.Adornment, "Auto",
                        $(go.Shape, { fill: "#FFFFCC" }),
                        $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                            new go.Binding("text", "", nodeInfo)
                        )
                    ),
                // this context menu Adornment is shared by all nodes
                contextMenu: partContextMenu
            }
    );

    normalLinkTemplate = 
        $(go.Link,
            { 
                toShortLength: 3, 
                relinkableFrom: true, 
                relinkableTo: true,
                curve: go.Link.Bezier,
                reshapable: true
            },  // allow the user to relink existing links
            new go.Binding("points").makeTwoWay(),
            $(go.Shape,
                {
                    strokeWidth: 1 
                },
                new go.Binding("stroke", "color").makeTwoWay()
            ),
            $(go.Shape,
                { 
                    toArrow: "Standard",
                    stroke: null
                },
                new go.Binding("stroke", "color").makeTwoWay(),
                new go.Binding("fill", "color").makeTwoWay(),
            ),
            { // this tooltip Adornment is shared by all links
                toolTip:
                    $(go.Adornment, "Auto",
                        $(go.Shape, { fill: "#FFFFCC" }),
                        $(go.TextBlock, 
                            { 
                                margin: 4 
                            },  // the tooltip shows the result of calling linkInfo(data)
                            new go.Binding("text", "", linkInfo)
                        )
                    ),
                // the same context menu Adornment is shared by all links
                contextMenu: partContextMenu
            }
        );

    orLinkTemplate = 
        $(go.Link,
            { 
                toShortLength: 3, 
                relinkableFrom: true, 
                relinkableTo: true,
                curve: go.Link.Bezier,
                reshapable: true
            },  // allow the user to relink existing links
            new go.Binding("points").makeTwoWay(),
            $(go.Shape,
                {
                    strokeWidth: 1 
                },
                new go.Binding("stroke", "color").makeTwoWay()
            ),
            $(go.Shape,
                {
                    toArrow: "Standard",
                    stroke: null
                },
                new go.Binding("fill", "color").makeTwoWay()
            ),
            $(go.Shape,
                {
                    strokeWidth: 1, 
                    fromArrow: "BackwardSemiCircle" 
                },
                new go.Binding("fill", "color").makeTwoWay()
            ),
            { // this tooltip Adornment is shared by all links
                toolTip:
                    $(go.Adornment, "Auto",
                        $(go.Shape, { fill: "#FFFFCC" }),
                        $(go.TextBlock, 
                            { 
                                margin: 4 
                            },  // the tooltip shows the result of calling linkInfo(data)
                            new go.Binding("text", "", linkInfo)
                        )
                    ),
                // the same context menu Adornment is shared by all links
                contextMenu: partContextMenu
            }
        );

    mapTemplate =
        $(go.Group, "Auto",
            {
                // highlight when dragging into the Group
                mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
                mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
                computesBoundsAfterDrag: true,
                // when the selection is dropped into a Group, add the selected Parts into that Group;
                // if it fails, cancel the tool, rolling back any changes
                mouseDrop: finishDrop,
                handlesDragDropForMembers: true
            },
            new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, "RoundedRectangle",
                {
                    strokeWidth: 1,
                    portId: "", 
                    cursor: "pointer",
                    fromLinkable: true, 
                    fromLinkableSelfNode: true, 
                    fromLinkableDuplicates: true,
                    toLinkable: true, 
                    toLinkableSelfNode: true, 
                    toLinkableDuplicates: true 
                },
                new go.Binding("fill", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : $(go.Brush, "Linear", { 0: "rgba(224,234,252,0.5)", 1: "rgba(207,222,243,0.5)" }); }).ofObject(),
            ),
            $(go.Panel, "Vertical",
                { 
                    defaultAlignment: go.Spot.Center, 
                    margin: 6 
                },
                $(go.Panel, "Horizontal",
                    { 
                        defaultAlignment: go.Spot.Top
                    },
                    $("SubGraphExpanderButton"), // the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
                    $(go.TextBlock,
                        {
                            font: "bold 12px sans-serif",
                            stroke: '#333',
                            margin: 4,  // make some extra space for the shape around the text
                            isMultiline: true,  // don't allow newlines in text
                            editable: true, 
                            alignment: go.Spot.Center
                        },
                        new go.Binding("text", "text").makeTwoWay())
                ),
                $(go.Placeholder, // create a placeholder to represent the area where the contents of the group are
                    { 
                        padding: new go.Margin(0, 5) 
                    }
                )
            ),  // end Vertical Panel
            { // this tooltip Adornment is shared by all nodes
                toolTip:
                    $(go.Adornment, "Auto",
                    $(go.Shape, { fill: "#FFFFCC" }),
                    $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                        new go.Binding("text", "", groupInfo).ofObject())
                    ),
                // this context menu Adornment is shared by all nodes
                contextMenu: partContextMenu
            }
        );  // end Group
    
    selectionAdornmentTemplate =
        $(go.Adornment, "Spot",
            $(go.Panel, "Auto",
                $(go.Shape,
                    { 
                        fill: null, 
                        stroke: "blue", 
                        strokeWidth: 2 
                    }
                ),
                $(go.Placeholder)  // a Placeholder sizes itself to the selected Node
            ),
            
            // the button to create a "next" node, at the top-right corner
            $("Button",
                {
                    alignment: go.Spot.TopRight,
                    click: addNode  // this function is defined below
                },
                $(go.Shape, 
                    { 
                        geometryString: "M0 0 L3 0 3 10 6 10 x F1 M6 6 L14 6 14 14 6 14z", 
                        fill: "gray" 
                    }
                )
            ) // end button
        ); // end Adornment
    

    conceptNodeTemplate.selectionAdornmentTemplate = selectionAdornmentTemplate;
    relationNodeTemplate.selectionAdornmentTemplate = selectionAdornmentTemplate;
    mapTemplate.selectionAdornmentTemplate = selectionAdornmentTemplate;

    myDiagram.nodeTemplateMap.add("concept", conceptNodeTemplate);
    myDiagram.nodeTemplateMap.add("relation", relationNodeTemplate);
    
    myDiagram.linkTemplateMap.add("normal", normalLinkTemplate);
    myDiagram.linkTemplateMap.add("or", orLinkTemplate);
    
    myDiagram.groupTemplateMap.add("map", mapTemplate);

    myDiagram.toolManager.linkingTool.linkValidation = validateLink;
    myDiagram.toolManager.relinkingTool.linkValidation = validateLink;

    let nodeDataArray =
        [
           

            {key:1, text:"Mapas Conceituais", category:"concept", loc:"-61 -442"},
            {key:2, text:"Conceitos", category:"concept", loc:"-300 -257"},
            {key:3, text:"Frases de ligação", category:"concept", loc:"-49 -239"},
            {key:4, text:"Conhecimento", category:"concept", loc:"338 -273"},
            {key:5, text:"Proposições", category:"concept", loc:"-156 -12"},
            {key:6, text:"substantivo", category:"concept", loc:"-311 -77"},
            {key:7, text:"Aprendiz", category:"concept", loc:"435 -129"},
            {key:8, text:"", category:"concept", loc:"386 24"},
            {key:9, text:"Aprendiz", category:"concept", loc:"204 -241"},
            {key:10, text:"Organizado", category:"concept", loc:"65 -9"},
            {key:11, text:"possui", category:"relation", loc:"-68 -333"},
            {key:12, text:"representa", loc:"263 -373", category:"relation"},
            {key:13, text:"interliga", loc:"-154 -244", category:"relation"},
            {key:14, text:"exemplo", loc:"-300 -152", category:"relation"},
            {key:15, text:"formam", loc:"-110 -102", category:"relation"},
            {key:16, text:"", loc:"490 -206", category:"relation"},
            {key:17, text:"é", loc:"440 -40", category:"relation"},
            {key:18, text:"faz", loc:"123 -323", category:"relation"},
            {text:"é", loc:"184 -112", category:"relation", key:-19}
        ];

    let linkDataArray =
        [
            {from:1, to:11, category:"normal", points:[-0.35988627660051264,-416.005078125,-0.8960890287082837,-382.5823619834524,-11.56051427842047,-354.91400260845245,-30.77042894363784,-333]},
        {from:11, to:2, category:"normal", points:[-65.19545806135211,-307.005078125,-116.54987295947663,-278.0238989416334,-170.21393545947663,-259.92122311543034,-228.9921875,-250.62047961023825]},
        {from:11, to:3, category:"normal", points:[-26.878776726359277,-307.005078125,-9.05980059702523,-291.85315688407314,3.0032538854550808,-269.1847975090731,6.397044772100678,-239.00000000000003]},
        {from:1, to:12, category:"normal", points:[60.697265625,-422.7657237688307,128.86407151614395,-415.7788161284813,197.72332323507976,-399.9588003600558,266.85340600547494,-373]},
        {from:12, to:4, category:"normal", points:[321.63508585619775,-347.005078125,345.0186377461315,-332.83762695827755,366.4767377751232,-308.1692675832776,381.5852951988809,-273]},
        {from:3, to:13, category:"normal", points:[-49.000000000000014,-215.61133412471298,-64.71360525931887,-212.73958083851102,-79.82167817598554,-213.31176743160165,-94.32421875000006,-219.09793428711097]},
        {from:13, to:2, category:"normal", points:[-154.00000000000006,-225.47611654654264,-180.58570373743808,-220.55204756379598,-205.5830995707714,-223.0458379540944,-229.62203244292354,-232.00507812499995]},
        {from:2, to:14, category:"normal", points:[-259.91115298590626,-232.00507812499995,-250.25576349156825,-204.63383076411665,-251.42844995325083,-177.96547138911666,-263.24316754053655,-152.00000000000003]},
        {from:14, to:6, category:"normal", points:[-262.4406433915086,-126.00507812500003,-253.81507045101202,-109.3134740007689,-254.17920540652418,-92.97844795910224,-263.36060848872097,-77]},
        {from:2, to:15, category:"normal", points:[-242.1001225369219,-232.00507812499995,-188.36187653162585,-200.8181853281501,-137.80407487172388,-157.48315928648344,-92.99262749980832,-102]},
        {from:3, to:15, category:"normal", points:[3.5224319597794036,-213.005078125,-11.760049312763527,-167.19442566986996,-36.16321004468938,-130.19273296153662,-67.87520171138847,-102]},
        {from:15, to:5, category:"normal", points:[-81.41250053209596,-76.005078125,-79.22489015761661,-49.741506207056844,-86.53847339019624,-28.739813498723514,-101.29926604926123,-12.999999999999993]},
        {from:4, to:16, category:"normal", points:[435.33789062499994,-247.21180984478107,444.2453584557492,-244.84653054917877,471.1939390913515,-228.914843443963,490.0000000000001,-205.86947458074567]},
        {from:16, to:7, category:"normal", points:[501.2739753271114,-180.005078125,502.6552715365882,-156.80880442361493,495.5161044825068,-139.8071117152816,483.09979622958866,-129]},
        {from:7, to:17, category:"normal", points:[471.4598191517228,-103.005078125,477.52659611721356,-79.05826965852535,473.59361804649376,-58.056576950192024,460.74713683179857,-40]},
        {from:17, to:8, category:"normal", points:[448.04036761720454,-14.005078124999997,441.8808472325725,9.135567103989064,430.5475138992392,22.52950649792843,407.0000000000001,33.227258857660885]},
        {from:9, to:18, category:"normal", points:[204.26820112988904,-241.00000000000006,188.0740194479598,-247.59847087764268,165.71755403541667,-266.4332793192731,146.8545016813197,-297.005078125]},
        {from:18, to:1, category:"normal", points:[123.99999999999977,-317.62866382611685,77.27029947422275,-341.65073762040646,40.94664870486356,-372.7510228057681,9.344729837365932,-416.005078125]},
        {from:9, to:-19, category:"normal", points:[236.15134087898625,-215.00507812500007,236.10407330062318,-175.7522256977263,225.01386196856325,-141.41719965605964,203.85060480122974,-112.00000000000009]},
        {category:"normal", from:-19, to:10, points:[188.78743656538927,-86.00507812500008,173.3212113948171,-50.81568201481244,150.64484614645494,-25.114964788112992,125.8361210175619,-9.99999999999995]}
            
        ];

    if(!!this.versionService.getCurrentLoadVersion()){
        swal({
            title: 'Are you sure?',
            text: 'You are loading a new content and you will lost all unseved data of the previous map.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, load it!',
            cancelButtonText: 'Don\'t load it',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
          if (result.value) {
            myDiagram.model = go.Model.fromJson(this.versionService.getCurrentLoadVersion().content);
            this.versionService.removeCurrentLoadVersion();
          }else{
            this.versionService.removeCurrentLoadVersion();
            (!!localStorage.getItem('currentModel')) ? 
                myDiagram.model = go.Model.fromJson(localStorage.getItem('currentModel')) :
                myDiagram.model = new go.GraphLinksModel(nodeDataArray,linkDataArray);
            }
        })
    }else{
        (!!localStorage.getItem('currentModel')) ? 
            myDiagram.model = go.Model.fromJson(localStorage.getItem('currentModel')) :
            myDiagram.model = new go.GraphLinksModel(nodeDataArray,linkDataArray);
    }
    
 }
  
  ngOnDestroy() {
      localStorage.setItem('currentModel', myDiagram.model.toJson());
  }
  
  changeColor(color) {
    // Always make changes in a transaction, except when initializing the diagram.
    myDiagram.startTransaction("change color");
    myDiagram.selection.each(function(node) {
      if (node instanceof go.Node) {  // ignore any selected Links and simple Parts
          // Examine and modify the data, not the Node directly.
          var data = node.data;
          // Call setDataProperty to support undo/redo as well as
          // automatically evaluating any relevant bindings.
          myDiagram.model.setDataProperty(data, "text-color", color);
      }
    });
    myDiagram.commitTransaction("change color");
  }
}

export function resetModel() {
    let nodeDataArray =
        [
           

            {key:1, text:"Mapas Conceituais", category:"concept", loc:"-61 -442"},
            {key:2, text:"Conceitos", category:"concept", loc:"-300 -257"},
            {key:3, text:"Frases de ligação", category:"concept", loc:"-49 -239"},
            {key:4, text:"Conhecimento", category:"concept", loc:"338 -273"},
            {key:5, text:"Proposições", category:"concept", loc:"-156 -12"},
            {key:6, text:"substantivo", category:"concept", loc:"-311 -77"},
            {key:7, text:"Aprendiz", category:"concept", loc:"435 -129"},
            {key:8, text:"", category:"concept", loc:"386 24"},
            {key:9, text:"Aprendiz", category:"concept", loc:"204 -241"},
            {key:10, text:"Organizado", category:"concept", loc:"65 -9"},
            {key:11, text:"possui", category:"relation", loc:"-68 -333"},
            {key:12, text:"representa", loc:"263 -373", category:"relation"},
            {key:13, text:"interliga", loc:"-154 -244", category:"relation"},
            {key:14, text:"exemplo", loc:"-300 -152", category:"relation"},
            {key:15, text:"formam", loc:"-110 -102", category:"relation"},
            {key:16, text:"", loc:"490 -206", category:"relation"},
            {key:17, text:"é", loc:"440 -40", category:"relation"},
            {key:18, text:"faz", loc:"123 -323", category:"relation"},
            {text:"é", loc:"184 -112", category:"relation", key:-19}
        ];

    let linkDataArray =
        [
            {from:1, to:11, category:"normal", points:[-0.35988627660051264,-416.005078125,-0.8960890287082837,-382.5823619834524,-11.56051427842047,-354.91400260845245,-30.77042894363784,-333]},
        {from:11, to:2, category:"normal", points:[-65.19545806135211,-307.005078125,-116.54987295947663,-278.0238989416334,-170.21393545947663,-259.92122311543034,-228.9921875,-250.62047961023825]},
        {from:11, to:3, category:"normal", points:[-26.878776726359277,-307.005078125,-9.05980059702523,-291.85315688407314,3.0032538854550808,-269.1847975090731,6.397044772100678,-239.00000000000003]},
        {from:1, to:12, category:"normal", points:[60.697265625,-422.7657237688307,128.86407151614395,-415.7788161284813,197.72332323507976,-399.9588003600558,266.85340600547494,-373]},
        {from:12, to:4, category:"normal", points:[321.63508585619775,-347.005078125,345.0186377461315,-332.83762695827755,366.4767377751232,-308.1692675832776,381.5852951988809,-273]},
        {from:3, to:13, category:"normal", points:[-49.000000000000014,-215.61133412471298,-64.71360525931887,-212.73958083851102,-79.82167817598554,-213.31176743160165,-94.32421875000006,-219.09793428711097]},
        {from:13, to:2, category:"normal", points:[-154.00000000000006,-225.47611654654264,-180.58570373743808,-220.55204756379598,-205.5830995707714,-223.0458379540944,-229.62203244292354,-232.00507812499995]},
        {from:2, to:14, category:"normal", points:[-259.91115298590626,-232.00507812499995,-250.25576349156825,-204.63383076411665,-251.42844995325083,-177.96547138911666,-263.24316754053655,-152.00000000000003]},
        {from:14, to:6, category:"normal", points:[-262.4406433915086,-126.00507812500003,-253.81507045101202,-109.3134740007689,-254.17920540652418,-92.97844795910224,-263.36060848872097,-77]},
        {from:2, to:15, category:"normal", points:[-242.1001225369219,-232.00507812499995,-188.36187653162585,-200.8181853281501,-137.80407487172388,-157.48315928648344,-92.99262749980832,-102]},
        {from:3, to:15, category:"normal", points:[3.5224319597794036,-213.005078125,-11.760049312763527,-167.19442566986996,-36.16321004468938,-130.19273296153662,-67.87520171138847,-102]},
        {from:15, to:5, category:"normal", points:[-81.41250053209596,-76.005078125,-79.22489015761661,-49.741506207056844,-86.53847339019624,-28.739813498723514,-101.29926604926123,-12.999999999999993]},
        {from:4, to:16, category:"normal", points:[435.33789062499994,-247.21180984478107,444.2453584557492,-244.84653054917877,471.1939390913515,-228.914843443963,490.0000000000001,-205.86947458074567]},
        {from:16, to:7, category:"normal", points:[501.2739753271114,-180.005078125,502.6552715365882,-156.80880442361493,495.5161044825068,-139.8071117152816,483.09979622958866,-129]},
        {from:7, to:17, category:"normal", points:[471.4598191517228,-103.005078125,477.52659611721356,-79.05826965852535,473.59361804649376,-58.056576950192024,460.74713683179857,-40]},
        {from:17, to:8, category:"normal", points:[448.04036761720454,-14.005078124999997,441.8808472325725,9.135567103989064,430.5475138992392,22.52950649792843,407.0000000000001,33.227258857660885]},
        {from:9, to:18, category:"normal", points:[204.26820112988904,-241.00000000000006,188.0740194479598,-247.59847087764268,165.71755403541667,-266.4332793192731,146.8545016813197,-297.005078125]},
        {from:18, to:1, category:"normal", points:[123.99999999999977,-317.62866382611685,77.27029947422275,-341.65073762040646,40.94664870486356,-372.7510228057681,9.344729837365932,-416.005078125]},
        {from:9, to:-19, category:"normal", points:[236.15134087898625,-215.00507812500007,236.10407330062318,-175.7522256977263,225.01386196856325,-141.41719965605964,203.85060480122974,-112.00000000000009]},
        {category:"normal", from:-19, to:10, points:[188.78743656538927,-86.00507812500008,173.3212113948171,-50.81568201481244,150.64484614645494,-25.114964788112992,125.8361210175619,-9.99999999999995]}
            
        ];
    myDiagram.model = new go.GraphLinksModel(nodeDataArray,linkDataArray);
}