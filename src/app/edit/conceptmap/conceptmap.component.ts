import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import * as go from "gojs";

declare var $ : any;
declare var swal : any;
export var myDiagram: go.Diagram;

@Component({
  selector: 'conceptmap',
  templateUrl: 'conceptmap.component.html'
})

export class ConceptMapComponent implements AfterViewInit {
  
  name = 'GoJS';

  @ViewChild('myDiagramDiv')
  element: ElementRef;

  ngAfterViewInit() {
    //(go as any).licenseKey = "...";
    document.title = "Concept Map Editor";

    const $ = go.GraphObject.make;  // for conciseness in defining templates

    let conceptNodeTemplate, relationNodeTemplate, normalLinkTemplate, orLinkTemplate, mapTemplate, selectionAdornmentTemplate;

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
            {text: "New Relation", loc:"", category:"relation"}:
            {text: "New Concept", loc:"", category:"concept",  color: "orange"};
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
            category: "normal"
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
            "clickCreatingTool.archetypeNodeData": { text: "New Concept", color: "orange", category: "concept" }, // allow double-click in background to create a new node
            "linkingTool.archetypeLinkData": {category: "normal"},
            "commandHandler.archetypeGroupData": { text: "New Map", isGroup: true, color: "blue", category: "map" }//ctrl+G to group
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
            $(go.Shape, "RoundedRectangle", 
            {
                portId: "", 
                strokeWidth: 0,
                fromLinkable: true, 
                fromLinkableSelfNode: true, 
                fromLinkableDuplicates: true,
                toLinkable: true, 
                toLinkableSelfNode: true, 
                toLinkableDuplicates: true,
                cursor: "pointer"
            },
                // Shape.fill is bound to Node.data.color
                new go.Binding("fill", "color")
            ),
            $(go.TextBlock,
                {
                    font: "bold 12px sans-serif",
                    stroke: '#333',
                    margin: 8,  // make some extra space for the shape around the text
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
            $(go.Shape, "RoundedRectangle", 
            {
                portId: "", 
                strokeWidth: 0,
                fromLinkable: true, 
                fromLinkableSelfNode: true, 
                fromLinkableDuplicates: true,
                toLinkable: true, 
                toLinkableSelfNode: true, 
                toLinkableDuplicates: true,
                cursor: "pointer",
                fill: "rgba(255,255,255,0)"
            }),
            $(go.TextBlock,
                {
                    font: "bold 12px sans-serif",
                    stroke: '#333',
                    margin: 8,  // make some extra space for the shape around the text
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
                routing: go.Link.AvoidsNodes,  // may be either Orthogonal or AvoidsNodes
                curve: go.Link.JumpGap,
                reshapable: true
            },  // allow the user to relink existing links
            new go.Binding("points").makeTwoWay(),
            $(go.Shape,
                {
                    strokeWidth: 2 
                },
                new go.Binding("stroke", "color").makeTwoWay()
            ),
            $(go.Shape,
                { 
                    toArrow: "Standard"
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
                routing: go.Link.AvoidsNodes,  // may be either Orthogonal or AvoidsNodes
                curve: go.Link.JumpGap,
                reshapable: true
            },  // allow the user to relink existing links
            new go.Binding("points").makeTwoWay(),
            $(go.Shape,
                {
                    strokeWidth: 2 
                },
                new go.Binding("stroke", "color").makeTwoWay()
            ),
            $(go.Shape,
                {
                    toArrow: "Standard"
                },
                new go.Binding("fill", "color").makeTwoWay()
            ),
            $(go.Shape,
                {
                    strokeWidth: 2, 
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
                    strokeWidth: 0,
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
            { key: 0, text: "Concept 1", color: "lightblue", category: "concept", loc:"-80 -6", group: 4 },
            { key: 1, text: "Concept 2", color: "orange", category: "concept", loc:"170 -30", group: 4},
            { key: 2, text: "Concept 3", color: "beige", category: "concept", loc:"170 10", group: 4},
            { key: 3, text: "Relation 1", category: "relation", loc:"30 -6", group: 4 },
            { key: 4, text: "Concept Map 1", isGroup: true, category: "map", expanded: true },
            { key: 5, text: "Relation 2", loc:"290 -30", category:"relation", },
            { key: 6, text: "Concept 4", loc:"400 -30", category:"concept", "color":"orange", }
        ];
    let linkDataArray =
        [
            { from: 0, to: 3, category: "normal", color: "red", group: 4 },
            { from: 3, to: 1, category: "or", group: 4 },
            { from: 3, to: 2, category: "or", group: 4 },
            { from: 1, to: 5, category :"normal"},
            { from: 5, to: 6, category :"normal"}
        ];
    
    myDiagram.model = new go.GraphLinksModel(nodeDataArray,linkDataArray);




    // myDiagram = 
    //   $(go.Diagram, 
    //     this.element.nativeElement, {
    //       initialAutoScale: go.Diagram.Uniform,  // an initial automatic zoom-to-fit
    //       initialContentAlignment: go.Spot.Center,  // center the content
    //       "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
    //       // allow double-click in background to create a new node
    //       "clickCreatingTool.archetypeNodeData": { text: "New Concept", color: $(go.Brush, "Linear", { 0: "rgb(254, 201, 0)", 1: "rgb(254, 162, 0)" }) },
    //         // allow Ctrl-G to call groupSelection()
    //       "commandHandler.archetypeGroupData": { text: "Group", isGroup: true, color: "blue" },
    //       "undoManager.isEnabled": true  // enable undo & redo
    //   });

    // // Define the appearance and behavior for Nodes:
    // // First, define the shared context menu for all Nodes, Links, and Groups.
    // // To simplify this code we define a function for creating a context menu button:
    // function makeButton(text: String, action: Function, visiblePredicate: any) {
    //   return $("ContextMenuButton",
    //     $(go.TextBlock, text),
    //     { click: action },
    //     // don't bother with binding GraphObject.visible if there's no predicate
    //     visiblePredicate ? new go.Binding("visible", "", function(o, e) { return o.diagram ? visiblePredicate(o, e) : false; }).ofObject() : {});
    // }

    // // a context menu is an Adornment with a bunch of buttons in them
    // var partContextMenu =
    //   $(go.Adornment, "Vertical",
    //     makeButton("Properties",
    //                 function(e: Object, obj: any) {  // OBJ is this Button
    //                   var contextmenu = obj.part;  // the Button is in the context menu Adornment
    //                   var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
    //                   // now can do something with PART, or with its data, or with the Adornment (the context menu)
    //                   if (part instanceof go.Link){ //alert(linkInfo(part.data));}
    //                      swal({
    //                         title: 'Relation ' + part.data.key +': ' + part.data.text,
    //                         text: "Relation from: " + nodeDataArray.find(o => o.key == part.data.from).text + " to: " + nodeDataArray.find(o => o.key == part.data.to).text,
    //                         buttonsStyling: false,
    //                         confirmButtonClass: 'btn btn-info'
    //                       });
    //                   }
    //                   else if (part instanceof go.Group){// alert(groupInfo(contextmenu));
    //                     var mems = part.memberParts.count;
    //                     var links = 0;
    //                     part.memberParts.each(function(p: any) {
    //                       if (p instanceof go.Link) links++;
    //                     });
    //                     var msg = "Map contain " + mems + " members including " + links + " links";
    //                     swal({
    //                         title: 'Map ' + part.data.key +': ' + part.data.text,
    //                         text: msg,
    //                         buttonsStyling: false,
    //                         confirmButtonClass: 'btn btn-info'
    //                       });
    //                   }
    //                   else{ //alert(nodeInfo(part.data));
    //                     var msg = ((part.data.group) ? "Member of map " + part.data.group + ': ' + nodeDataArray.find(o => o.key == part.data.group).text : "Top-level concept");
    //                     swal({
    //                         title: 'Node ' + part.data.key +': ' + part.data.text,
    //                         text: msg,
    //                         buttonsStyling: false,
    //                         confirmButtonClass: 'btn btn-info'
    //                       });
    //                   }
    //                 }, false),
    //     makeButton("Cut",
    //                 function(e: any, obj: any) { e.diagram.commandHandler.cutSelection(); },
    //                 function(o: any) { return o.diagram.commandHandler.canCutSelection(); }),
    //     makeButton("Copy",
    //                 function(e: any, obj: any) { e.diagram.commandHandler.copySelection(); },
    //                 function(o: any) { return o.diagram.commandHandler.canCopySelection(); }),
    //     makeButton("Paste",
    //                 function(e: any, obj: any) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
    //                 function(o: any) { return o.diagram.commandHandler.canPasteSelection(); }),
    //     makeButton("Delete",
    //                 function(e: any, obj: any) { e.diagram.commandHandler.deleteSelection(); },
    //                 function(o: any) { return o.diagram.commandHandler.canDeleteSelection(); }),
    //     makeButton("Undo",
    //                 function(e: any, obj: any) { e.diagram.commandHandler.undo(); },
    //                 function(o: any) { return o.diagram.commandHandler.canUndo(); }),
    //     makeButton("Redo",
    //                 function(e: any, obj: any) { e.diagram.commandHandler.redo(); },
    //                 function(o: any) { return o.diagram.commandHandler.canRedo(); }),
    //     makeButton("Group",
    //                 function(e: any, obj: any) { e.diagram.commandHandler.groupSelection(); },
    //                 function(o: any) { return o.diagram.commandHandler.canGroupSelection(); }),
    //     makeButton("Ungroup",
    //                 function(e: any, obj: any) { e.diagram.commandHandler.ungroupSelection(); },
    //                 function(o: any) { return o.diagram.commandHandler.canUngroupSelection(); })
    //   );

    // function nodeInfo(d: any) {  // Tooltip info for a node data object
    //   var str = "Node " + d.key + ": " + d.text + "\n";
    //   if (d.group)
    //     str += "member of " + d.group;
    //   else
    //     str += "top-level node";
    //   return str;
    // }

    // // Define the appearance and behavior for Links:
    // function linkInfo(d: any) {  // Tooltip info for a link data object
    //   return "Link: " + d.text + "\nfrom " + d.from + " to " + d.to;
    // }

    // // Define the appearance and behavior for Groups:
    // function groupInfo(adornment: any) {  // takes the tooltip or context menu, not a group node data object
    //   var g = adornment.adornedPart;  // get the Group that the tooltip adorns
    //   var mems = g.memberParts.count;
    //   var links = 0;
    //   g.memberParts.each(function(part: any) {
    //     if (part instanceof go.Link) links++;
    //   });
    //   return "Group " + g.data.key + ": " + g.data.text + "\n" + mems + " members including " + links + " links";
    // }

    // myDiagram.nodeTemplate =
    //   $(go.Node, "Auto",  // the whole node panel
    //     { locationSpot: go.Spot.Center },
    //       new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    //     // define the node's outer shape, which will surround the TextBlock
    //     $(go.Shape, "Rectangle",
    //       { fill: $(go.Brush, "Linear", { 0: "rgb(254, 201, 0)", 1: "rgb(254, 162, 0)" }), stroke: "black", portId: "", cursor: "pointer",
    //         fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
    //         toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true },
    //         new go.Binding("fill", "color").makeTwoWay(),
    //          new go.Binding("stroke", "border-color").makeTwoWay()),
            
    //     $(go.TextBlock,
    //       { font: "10pt Roboto, helvetica, arial, sans-serif", margin: 4, editable: true, stroke: "black" },
    //       new go.Binding("text", "text").makeTwoWay(),
    //       new go.Binding("stroke", "text-color").makeTwoWay()),
    //       { // this tooltip Adornment is shared by all nodes
    //         toolTip:
    //           $(go.Adornment, "Auto",
    //             $(go.Shape, { fill: "#FFFFCC" }),
    //             $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
    //               new go.Binding("text", "", nodeInfo))
    //           ),
    //         // this context menu Adornment is shared by all nodes
    //         contextMenu: partContextMenu
    //       }
    //   );

    // // unlike the normal selection Adornment, this one includes a Button
    // myDiagram.nodeTemplate.selectionAdornmentTemplate =
    //   $(go.Adornment, "Spot",
    //     $(go.Panel, "Auto",
    //       $(go.Shape, { fill: null, stroke: "blue", strokeWidth: 2 }),
    //       $(go.Placeholder)  // a Placeholder sizes itself to the selected Node
    //     ),
    //     // the button to create a "next" node, at the top-right corner
    //     $("Button",
    //       {
    //         alignment: go.Spot.TopRight,
    //         click: addNodeAndLink  // this function is defined below
    //       },
    //       $(go.Shape, { geometryString: "M0 0 L3 0 3 10 6 10 x F1 M6 6 L14 6 14 14 6 14z", fill: "gray" })
    //     ) // end button
    //   ); // end Adornment
    // // clicking the button inserts a new node to the right of the selected node,
    // // and adds a link to that new node
    // function addNodeAndLink(e: any, obj: any) {
    //   var adornment = obj.part;
    //   var diagram = e.diagram;
    //   diagram.startTransaction("Add State");

    //   // get the node data for which the user clicked the button
    //   var fromNode = adornment.adornedPart;
    //   var fromData = fromNode.data;
    //   // create a new "State" data object, positioned off to the right of the adorned Node
    //   var toData = { text: "New Concept", loc:"" };
    //   var p = fromNode.location.copy();
    //   p.x += 200;
    //   toData.loc = go.Point.stringify(p);  // the "loc" property is a string, not a Point object
    //   // add the new node data to the model
    //   var model = diagram.model;
    //   model.addNodeData(toData);

    //   // create a link data from the old node data to the new node data
    //   var linkdata = {
    //     from: model.getKeyForNodeData(fromData),  // or just: fromData.id
    //     to: model.getKeyForNodeData(toData),
    //     text: "New Relation"
    //   };
    //   // and add the link data to the model
    //   model.addLinkData(linkdata);

    //   // select the new Node
    //   var newnode = diagram.findNodeForData(toData);
    //   diagram.select(newnode);

    //   diagram.commitTransaction("Add State");

    //   // if the new node is off-screen, scroll the diagram to show the new node
    //   diagram.scrollToRect(newnode.actualBounds);
    // }

    // // replace the default Link template in the linkTemplateMap
    // myDiagram.linkTemplate =
    //   $(go.Link,  // the whole link panel
    //     {
    //       curve: go.Link.Bezier, adjusting: go.Link.Stretch,
    //       toShortLength: 3, relinkableFrom: true, relinkableTo: true,
    //       reshapable: true
    //     },
    //     new go.Binding("points").makeTwoWay(),
    //     new go.Binding("curviness"),
    //     $(go.Shape,  // the link shape
    //       { stroke: "black" },
    //       new go.Binding("stroke", "border-color").makeTwoWay()),
    //     $(go.Shape,  // the arrowhead
    //       { toArrow: "standard", stroke: null },
    //       new go.Binding("fill", "border-color").makeTwoWay()),
    //     $(go.Panel, "Auto",
    //       $(go.Shape,  // the label background, which becomes transparent around the edges
    //         { fill: $(go.Brush, "Radial", { 0: "rgb(240, 240, 240)", 0.2: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" }),
    //           stroke: null }),
    //       $(go.TextBlock, "New Relation", // the label text
    //         { textAlign: "center",
    //           font: "10pt Roboto, helvetica, arial, sans-serif",
    //           stroke: "#333333",
    //           margin: 4,
    //           editable: true  // allow in-place editing by user
    //         },
    //         new go.Binding("text", "text").makeTwoWay(),
    //         new go.Binding("stroke", "text-color").makeTwoWay())
    //     ),
    //     { // this tooltip Adornment is shared by all links
    //       toolTip:
    //         $(go.Adornment, "Auto",
    //           $(go.Shape, { fill: "#FFFFCC" }),
    //           $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling linkInfo(data)
    //             new go.Binding("text", "", linkInfo))
    //         ),
    //       // the same context menu Adornment is shared by all links
    //       contextMenu: partContextMenu
    //     }
    //   );

    // // when the document is modified, add a "*" to the title and enable the "Save" button
    // myDiagram.addDiagramListener("Modified", function(e) {
    //   var idx = document.title.indexOf("*");
    //   if (myDiagram.isModified) {
    //     if (idx < 0) document.title += "*";
    //   } else {
    //     if (idx >= 0) document.title = document.title.substr(0, idx);
    //   }
    // });

    // // Groups consist of a title in the color given by the group node data
    // // above a translucent gray rectangle surrounding the member parts
    // myDiagram.groupTemplate =
    //   $(go.Group, "Auto",{ 
    //       // upon expansion, a Diagram Listener will generate contents for the group
    //       isSubGraphExpanded: false},
    //        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    //        new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),
    //     $(go.Shape, "Rectangle",
    //       { fill: $(go.Brush, "Linear", { 0: "rgb(224,234,252)", 1: "rgb(207,222,243)" }), stroke: "black", portId: "", cursor: "pointer",
    //         fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
    //         toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true }),
    //     $(go.Panel, "Vertical",
    //       { defaultAlignment: go.Spot.Left, margin: 4 },
    //       $(go.Panel, "Horizontal",
    //         { defaultAlignment: go.Spot.Top },
    //         // the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
    //         $("SubGraphExpanderButton"),
    //         $(go.TextBlock,
    //           { font: "10pt Roboto, helvetica, arial, sans-serif", margin: 2, editable: true },
    //           new go.Binding("text", "text").makeTwoWay())
    //       ),
    //       // create a placeholder to represent the area where the contents of the group are
    //       $(go.Placeholder,
    //         { padding: new go.Margin(0, 5) })
    //     ),  // end Vertical Panel
    //     { // this tooltip Adornment is shared by all nodes
    //       toolTip:
    //         $(go.Adornment, "Auto",
    //           $(go.Shape, { fill: "#FFFFCC" }),
    //           $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
    //             new go.Binding("text", "", groupInfo).ofObject())
    //         ),
    //       // this context menu Adornment is shared by all nodes
    //       contextMenu: partContextMenu
    //     }
    //   );  // end Group
    //   // unlike the normal selection Adornment, this one includes a Button
    //   myDiagram.groupTemplate.selectionAdornmentTemplate =
    //     $(go.Adornment, "Spot",
    //       $(go.Panel, "Auto",
    //         $(go.Shape, { fill: null, stroke: "blue", strokeWidth: 2 }),
    //         $(go.Placeholder)  // a Placeholder sizes itself to the selected Node
    //       ),
    //       // the button to create a "next" node, at the top-right corner
    //       $("Button",
    //         {
    //           alignment: go.Spot.TopRight,
    //           click: addNodeAndLink  // this function is defined below
    //         },
    //         $(go.Shape, { geometryString: "M0 0 L3 0 3 10 6 10 x F1 M6 6 L14 6 14 14 6 14z", fill: "gray" })
    //       ) // end button
    //     ); // end Adornment
    // // Define the behavior for the Diagram background:
    // function diagramInfo(model: any) {  // Tooltip info for the diagram's model
    //   return "Model:\n" + model.nodeDataArray.length + " nodes, " + model.linkDataArray.length + " links";
    // }

    // // provide a tooltip for the background of the Diagram, when not over any Part
    // myDiagram.toolTip =
    //   $(go.Adornment, "Auto",
    //     $(go.Shape, { fill: "#FFFFCC" }),
    //     $(go.TextBlock, { margin: 4 },
    //       new go.Binding("text", "", diagramInfo))
    //   );

    // // provide a context menu for the background of the Diagram, when not over any Part
    // myDiagram.contextMenu =
    //   $(go.Adornment, "Vertical",
    //       makeButton("Paste",
    //                  function(e: any, obj: any) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
    //                  function(o: any) { return o.diagram.commandHandler.canPasteSelection(); }),
    //       makeButton("Undo",
    //                  function(e: any, obj: any) { e.diagram.commandHandler.undo(); },
    //                  function(o: any) { return o.diagram.commandHandler.canUndo(); }),
    //       makeButton("Redo",
    //                  function(e: any, obj: any) { e.diagram.commandHandler.redo(); },
    //                  function(o: any) { return o.diagram.commandHandler.canRedo(); })
    //   );

    // var nodeDataArray = [
    //   { key: 1, text: "Concept A", loc:"-58.51049804687506 60.87724609375" },
    //   { key: 2, text: "Concept B", loc:"123.27490234375 11.87724609375" }
    // ];
    // var linkDataArray = [
    //   { from: 1, to: 2, text: "Relation  1" },
    //   { from: 1, to: 1, text: "Relation 2" }
    // ];

    // // create the model data that will be represented by Nodes and Links
    // myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
  }
  save() {
      console.log('Save map');
  };
  load() {
      console.log('Load map');
  };
  
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