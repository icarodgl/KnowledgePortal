import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import * as go from 'gojs';
export var myDiagram: go.Diagram;
import { AuthService, MapService, MeService, ModelService } from '../../_services/index.service';
import { User, ConceptMap } from '../../_models/index.model';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { SharedService } from 'app/_services/shared.service';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('myDiagramDiv') element: ElementRef;

  private images:SafeHtml[] = new Array<SafeHtml>();
  public user:User;
  public maps: ConceptMap[] = [];

  constructor( 
      private _sanitizer: DomSanitizer, 
      private authServicve: AuthService,
      private mapService: MapService,
      private meService: MeService,
      private router: Router,
      private sharedService: SharedService,
  ){
      this.user = JSON.parse(this.authServicve.getCurrentUser());
  }
    public ngOnInit() {
        this.initi()
        if (!this.mapService.requisizaoFeita) {
            this.mapService.getAll().subscribe(maps => {
                    this.mapService.requisizaoFeita = true
                    this.mapService.mapas = maps
                    let serializer = new XMLSerializer();
                    let svg;
                    for (let m of maps) {
                        if (m['last_version']) {
                            myDiagram.model = go.Model.fromJson(m['last_version']);
                            svg = myDiagram.makeSvg({
                                scale: 0.5,
                                maxSize: new go.Size(NaN, 220)
                            });
                            this.images.push(this._sanitizer.bypassSecurityTrustHtml(serializer.serializeToString(svg)))
                        }
                    }
                    this.maps = maps
                })
        }
        else {
                this.maps = this.mapService.mapas
                let serializer = new XMLSerializer();
                let svg;
                for (let m of this.maps) {
                    if (m['last_version']) {
                        myDiagram.model = go.Model.fromJson(m['last_version']);
                        svg = myDiagram.makeSvg({
                            scale: 0.5,
                            maxSize: new go.Size(NaN, 220)
                        });
                        this.images.push(this._sanitizer.bypassSecurityTrustHtml(serializer.serializeToString(svg)))
                    }
                }

            }
    }

    initi() {

        let conceptNodeTemplate, relationNodeTemplate, normalLinkTemplate, orLinkTemplate, mapTemplate, selectionAdornmentTemplate;
        const $ = go.GraphObject.make;  // for conciseness in defining templates

        // To simplify this code we define a function for creating a context menu button:
        function makeButton(text, action, visiblePredicate) {
            return $("ContextMenuButton",
                $(go.TextBlock, text),
                { click: action },
                // don't bother with binding GraphObject.visible if there's no predicate
                visiblePredicate ? new go.Binding("visible", "", function (o, e) { return o.diagram ? visiblePredicate(o, e) : false; }).ofObject() : {});
        }

        function addNode(e, obj) {
            var adornment = obj.part;
            var diagram = e.diagram;
            diagram.startTransaction("Add State");

            // get the node data for which the user clicked the button
            var fromNode = adornment.adornedPart;
            var fromData = fromNode.data;
            // create a new "State" data object, positioned off to the right of the adorned Node
            var newNode = (fromNode.category == "concept" || fromNode.category == "map") ?
                { text: "New Relation", loc: "", category: "relation", error: "" } :
                { text: "New Concept", loc: "", category: "concept", error: "" };
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
            if (d.category == "relation") {
                str = "Relation " + d.text + "\n";
            } else if (d.category == "concept") {
                str = "Concept " + d.text + "\n";
            }
            if (d.group)
                str += "Member of " + d.group;
            else
                str += "Top-level";

            str += "\nMore Informations: " + (d.moreInfo ? d.moreInfo : "");

            return str;
        }

        // Define the appearance and behavior for Links:
        function linkInfo(d) {  // Tooltip info for a link data object
            return "Link:\nfrom " + d.from + " to " + d.to + + "\nMore Informations: " + (d.data.moreInfo ? d.data.moreInfo : "");
        }

        // Define the appearance and behavior for Groups:
        function groupInfo(adornment) {  // takes the tooltip or context menu, not a group node data object
            let g = adornment.adornedPart;  // get the Group that the tooltip adorns
            let mems = g.memberParts.count;
            let links = 0;
            g.memberParts.each(function (part) {
                if (part instanceof go.Link) links++;
            });
            let relations = 0;
            g.memberParts.each(function (part) {
                if (part instanceof go.Node && part.category == "relation") relations++;
            });
            return "Group " + g.data.key + ": " + g.data.text + "\n" + mems + " members including: \nLinks: " + links + "\nRelations: " + relations + "\nConcepts: " + (mems - links - relations) + "\nMore Informations: " + (g.data.moreInfo ? g.data.moreInfo : "");
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
            if (fromnode.data.category == "relation") {
                if (tonode.data.category == "concept" || tonode.data.category == "map") return true;
                else return false;
            } else return tonode.data.category == "relation";

        }

        function checkInconsistence(d) {
            let message = "";
            myDiagram.selection.each(function (node) {
                myDiagram.startTransaction("remove error");

                const fix = node.data.fix;
                const error = node.data.error;

                if ('conceitoRepetido' === error) {
                    // remove concepts
                    console.log('remove concepts');
                }

                if (fix) {
                    myDiagram.model.setDataProperty(node.data, "text", fix)
                }

                var data = node.data;
                console.log(data.prevColor);
                data.category === 'relation' ? myDiagram.model.setDataProperty(data, "textColor", data.prevColor) : myDiagram.model.setDataProperty(data, "stroke", data.prevColor);
                myDiagram.model.setDataProperty(data, "error", null);
                myDiagram.model.setDataProperty(data, "textColor", '#333');
                myDiagram.commitTransaction("remove error");
            });

            swal({
                title: 'Você deseja fazer essa correção?',
                text: `A frase de ligação possui um erro de concordância que pode prejudicar a mensagem da proposição. 
            
            Você pode corrigir para "possuem".`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, faça a correção!',
                cancelButtonText: 'Não, deixe como está',
                confirmButtonClass: "btn btn-success",
                cancelButtonClass: "btn btn-danger",
                buttonsStyling: false
            }).then((result) => {
                if (result.value) {
                    swal({
                        title: 'Corrigido!',
                        text: 'A inconsistência foi corrigida com sucesso.',
                        type: 'success',
                        confirmButtonClass: "btn btn-success",
                        buttonsStyling: false
                    }).catch(swal.noop)
                } else {
                    swal({
                        title: 'Cancelled',
                        text: 'Your imaginary file is safe :)',
                        type: 'error',
                        confirmButtonClass: "btn btn-info",
                        buttonsStyling: false
                    }).catch(swal.noop)
                }
            })
        }

        // a context menu is an Adornment with a bunch of buttons in them
        let partContextMenu =
            $(go.Adornment, "Vertical",
                makeButton("Properties",
                    function (e, obj) {  // OBJ is this Button
                        var contextmenu = obj.part;  // the Button is in the context menu Adornment
                        var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
                        // now can do something with PART, or with its data, or with the Adornment (the context menu)
                        if (part instanceof go.Link) {
                            swal({
                                title: 'Link Informations',
                                text: linkInfo(part.data),
                                type: 'info',
                                showCancelButton: false,
                                confirmButtonText: 'Ok',
                                confirmButtonClass: "btn btn-success",
                                buttonsStyling: false
                            });
                        }
                        else if (part instanceof go.Group) {
                            swal({
                                title: 'Group Informations',
                                text: groupInfo(contextmenu),
                                type: 'info',
                                showCancelButton: false,
                                confirmButtonText: 'Ok',
                                confirmButtonClass: "btn btn-success",
                                buttonsStyling: false
                            });
                        }
                        else {
                            swal({
                                title: 'Node/Relation Informations',
                                text: nodeInfo(part.data),
                                type: 'info',
                                showCancelButton: false,
                                confirmButtonText: 'Ok',
                                confirmButtonClass: "btn btn-success",
                                buttonsStyling: false
                            });
                        }
                    }, undefined),
                makeButton("Cut",
                    function (e, obj) { e.diagram.commandHandler.cutSelection(); },
                    function (o) { return o.diagram.commandHandler.canCutSelection(); }),
                makeButton("Copy",
                    function (e, obj) { e.diagram.commandHandler.copySelection(); },
                    function (o) { return o.diagram.commandHandler.canCopySelection(); }),
                makeButton("Paste",
                    function (e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
                    function (o) { return o.diagram.commandHandler.canPasteSelection(); }),
                makeButton("Delete",
                    function (e, obj) { e.diagram.commandHandler.deleteSelection(); },
                    function (o) { return o.diagram.commandHandler.canDeleteSelection(); }),
                makeButton("Undo",
                    function (e, obj) { e.diagram.commandHandler.undo(); },
                    function (o) { return o.diagram.commandHandler.canUndo(); }),
                makeButton("Redo",
                    function (e, obj) { e.diagram.commandHandler.redo(); },
                    function (o) { return o.diagram.commandHandler.canRedo(); }),
                makeButton("Group",
                    function (e, obj) { e.diagram.commandHandler.groupSelection(); },
                    function (o) { return o.diagram.commandHandler.canGroupSelection(); }),
                makeButton("Ungroup",
                    function (e, obj) { e.diagram.commandHandler.ungroupSelection(); },
                    function (o) { return o.diagram.commandHandler.canUngroupSelection(); })
            );
        myDiagram =
            $(go.Diagram, this.element.nativeElement, // create a Diagram for the DIV HTML element
                {
                    allowDrop: true, // from Palette
                    // what to do when a drag-drop occurs in the Diagram's background
                    mouseDrop: function (e) { finishDrop(e, null); },
                    initialContentAlignment: go.Spot.Center, // center the content
                    "undoManager.isEnabled": true,  // enable undo (CTRL+Z) & redo (CTRL+Y)
                    "clickCreatingTool.archetypeNodeData": { text: "New Concept", category: "concept" }, // allow double-click in background to create a new node
                    "linkingTool.archetypeLinkData": { category: "normal" },
                    "commandHandler.archetypeGroupData": { text: "New Map", isGroup: true, category: "map" },//ctrl+G to group

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
                    function (e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
                    function (o) { return o.diagram.commandHandler.canPasteSelection(); }),
                makeButton("Undo",
                    function (e, obj) { e.diagram.commandHandler.undo(); },
                    function (o) { return o.diagram.commandHandler.canUndo(); }),
                makeButton("Redo",
                    function (e, obj) { e.diagram.commandHandler.redo(); },
                    function (o) { return o.diagram.commandHandler.canRedo(); })
            );

        conceptNodeTemplate =
            $(go.Node, "Auto",  // the Shape will go around the TextBlock
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "RoundedRectangle",
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
                        fill: $(go.Brush, "Linear", { 0: "rgb(254, 201, 0)", 1: "rgb(254, 162, 0)" }),
                        stroke: "black"
                    },
                    // Shape.fill is bound to Node.data.color
                    new go.Binding("fill", "color").makeTwoWay(),
                    new go.Binding("stroke", "stroke").makeTwoWay(),
                    new go.Binding("stroke", "", function (data) { return data.error ? "red" : data.stroke ? data.stroke : "black"; }),
                    new go.Binding("strokeWidth", "error", function (t) { return t ? 3 : 1; })
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
                    new go.Binding("text", "text").makeTwoWay(),
                    new go.Binding("stroke", "textColor").makeTwoWay()
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
                    }),
                $(go.TextBlock,
                    {
                        font: "bold 12px sans-serif",
                        stroke: '#333',
                        margin: 6,  // make some extra space for the shape around the text
                        isMultiline: true,  // don't allow newlines in text
                        editable: true
                    },  // some room around the text
                    // TextBlock.text is bound to Node.data.key
                    new go.Binding("text", "text").makeTwoWay(),
                    new go.Binding("stroke", "textColor").makeTwoWay(),
                    new go.Binding("stroke", "", function (data) { return data.error ? "red" : data.textColor ? data.textColor : "#333"; }),
                    new go.Binding("font", "error", function (t) { return t ? "bold 14px sans-serif" : "bold 12px sans-serif"; })
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
                    mouseDragEnter: function (e, grp, prev) { highlightGroup(e, grp, true); },
                    mouseDragLeave: function (e, grp, next) { highlightGroup(e, grp, false); },
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
                        toLinkableDuplicates: true,
                        fill: $(go.Brush, "Linear", { 0: "rgba(224,234,252,0.5)", 1: "rgba(207,222,243,0.5)" })
                    },
                    //new go.Binding("fill", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : $(go.Brush, "Linear", { 0: "rgba(224,234,252,0.5)", 1: "rgba(207,222,243,0.5)" }); }).ofObject(),
                    new go.Binding('fill', 'color').makeTwoWay(),
                    new go.Binding("stroke", "", function (data) { return data.error ? "red" : data.stroke ? data.stroke : "black"; }),
                    new go.Binding("strokeWidth", "error", function (t) { return t ? 3 : 1; })
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
                            new go.Binding("text", "text").makeTwoWay(),
                            new go.Binding("stroke", "textColor").makeTwoWay(),
                        )
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
                ),
                $("Button",
                    new go.Binding("opacity", "error", function (t) { return t ? 1 : 0; }),
                    { alignment: go.Spot.BottomRight, opacity: 0 },
                    $(go.Shape, "FivePointedBurst", { width: 8, height: 8 }),
                    { click: checkInconsistence })
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

    }

    click(n) {
        this.mapService.setCurrentMap(this.maps[n]);
        this.router.navigate(['/edit/cmap/edit/', this.maps[n]._id);
   }
   newMap(e){
       e.preventDefault();
       swal({
            title: 'Você tem certeza?',
           text: "Se você tiver um mapa ainda não salvo, isso excluirá todas as informações não salvas. Você deseja continuar?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: 'Sim, criar um novo...',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false
       }).then((result) => {
            if (result.value) {
                this.router.navigate(['edit','cmap']);
            }
        });
    }

    removeMap(posicao: number) {
        this.mapService.removeMap(this.maps[posicao]._id).subscribe(
            success => {
                this.sharedService.nofiticacao(JSON.parse(success).message, 'success')
                this.images.splice(posicao, 1)
                this.maps.splice(posicao, 1)  
            },
            error => {
                this.sharedService.nofiticacao(error.error, 'danger')
            })
    }
}
