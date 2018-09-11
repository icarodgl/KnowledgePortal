import * as go from "gojs";
import * as pegjs from "pegjs";
import { myDiagram } from '../edit/conceptmap/conceptmap.component';
import swal from 'sweetalert2';

export class SpeechAnalysis {

    grammar= 'start =  sentence'+ '\n'+

    'ws "whitespace" = [ \\t\\n\\r]*'+ '\n\n'+
    
    'sentence = concept relation concept'+  '\n\n'+
               
    'concept = cct:(cnoun conj cnoun) {return cct.join(" ").trim();} /'+'\n'+
    '          cct:(det? cnoun) {return cct.join(" ").replace(\/\\s\\s+\/g, \' \').trim()} /'+ '\n\n'+
    '          cct:(spnoun (adj/adv)?) {return cct.join(" ").trim()}'+ '\n\n'+
    
    'relation = rlt:(verb adp) {return rlt.join(" ").trim()} /'+ '\n'+
    '           rlt:(verb verb verb? adp) {return rlt.join(" ").replace(\/[, ]+\/g, " ").trim()} /'+ '\n'+
    '           rlt:(pron verb adp) {return rlt.trim();} /'+ '\n'+
    '           rlt:(adp pron verb) {return rlt.trim();} /'+ '\n'+
    '           rlt:(adv verb) {return rlt.trim();} /'+ '\n'+
    '           rlt:( verb ) {return rlt.trim();} '+ '\n\n'+
                   
    'verb = verb:("[VERB," tag "]") ws {return verb[1].trim();}'+ '\n\n'+
    
    'noun = noun:("[NOUN," tag "]") ws {return noun[1].trim();}'+ '\n\n'+
    
    'det = det:("[DET," tag "]") ws {return det[1].trim();}'+ '\n\n'+
    
    'adp = adp:("[ADP," tag "]") ws {return adp[1].trim();}'+ '\n\n'+
    
    'adj = adj:("[ADJ," tag "]") ws {return adj[1].trim();}'+ '\n\n'+

    'adv = adv:("[ADV," tag "]") ws {return adv[1].trim();}'+ '\n\n'+

    'pron = pron:("[PRON," tag "]") ws {return pron[1].trim();}'+ '\n\n'+

    'conj = conj:("[CONJ," tag "]") ws {return conj[1].trim();}'+ '\n\n'+

    'punct = punct:("[PUNCT," "-" "]") ws {return punct[1].trim();}' + '\n\n'+

    'spnoun = spnoun:(verb (punct pron)?) ws{return spnoun.join("").replace(\/[,]+\/g, "").trim();}'+ '\n\n'+
    
    'cnoun = cnoun:(noun adp noun adj) {return cnoun.join(" ").trim();} /'+ '\n'+
    '        cnoun:(noun adp noun) {return cnoun.join(" ").trim();} /'+ '\n'+
    '        cnoun:(noun conj noun) {return cnoun.join(" ").trim();} /'+ '\n'+
    '        cnoun:(noun adj) {return cnoun.join(" ").trim();} /'+ '\n'+
    '        cnoun:(noun) {return cnoun.trim();} /'+ '\n'+
    '        cnoun:(adv) {return cnoun.trim();} /'+ '\n'+
    '        cnoun:(pron noun?) {return cnoun.join(" ").trim();} /'+ '\n'+
    '        cnoun:(adj) {return cnoun.trim();}'+ '\n'+
    
    'tag = tag:[a-zA-Z\\u00C0-\\u00FF]+ {return tag.join("");}'+'\n';

    /**
      * Gera a string para o parser, envia para o parser
      * envia as triplas para a montagem do mapa
      * @param syntax o retorno da Google Cloud Natural Language.
      */
    analyze(syntax:any) {
        var query: string;

        query = this.generateString(syntax.tokens);

        var parser = pegjs.generate(this.grammar);

        try {
            var proposition = parser.parse(query);
            this.addNodesToMap(proposition);
        }catch(error){
            if(error.name === 'SyntaxError'){
                swal({
                    title: 'Syntax Error',
                    //text: error.message,
                    text: "Ocorreu um erro na extração das triplas. " +
                          "Verifique se a proposição está no formato correto "+
                          "e tente novamente.",
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-info'
                  });
            }
            console.log(error.name);
        }
    }

    /**
      * Gera a string que será enviada para o parser (PEG.js)
      * extrair as triplas
      * @param syntax parte da resposta da GCNL que contem os tokens gramaticais.
      */
    generateString(tokens:any): string{
        var query:string='';
        var tag:string;
        var text:string;

        tokens.forEach(part => {
            tag = part.partOfSpeech.tag;
            text = part.text.content;
            query+="["+tag+","+text+"]";
        });

        console.log(query);
        return query;
    }

    capitalize(s) {
        var first_char = /\S/;
        return s.replace(first_char, function(m) { return m.toUpperCase(); });
    }

    /**
      * Recebe um array com as trilpas e faz a inserção das triplas no mapa conceitual
      * proposition[0]: conceito1
      * proposition[1]: relação
      * proposition[2]: conceito2
      * @param proposition array de strings que contem as triplas. 
      */
    addNodesToMap(proposition: string[]) {
        var relation;
        var node1;
        var node2;
        var model = <go.GraphLinksModel>myDiagram.model;

        proposition[0] = this.capitalize(proposition[0]);
        proposition[2] = this.capitalize(proposition[2]);
        proposition[1] = proposition[1].toLocaleLowerCase();

        myDiagram.startTransaction("new node");
        node1 = myDiagram.findNodeForKey(proposition[0]);
        node2 = myDiagram.findNodeForKey(proposition[2]);

        if (node1 && node2) {
            
            let id1 = node1.data.key;
            let id2 = node2.data.key;
            let newLink = { from: id1, to: id2, text: proposition[1] };

            model.addLinkData(newLink);

        } else
            if (node1) {
                let id = node1.data.key;
                let newNode = { key: proposition[2], text: proposition[2] };
                let newLink = { from: id, to: proposition[2], text: proposition[1] };

                model.addNodeData(newNode);
                model.addLinkData(newLink);

            } else {
                if (node2) {
                    let id = node2.data.key;
                    let newNode = { key: proposition[0], text: proposition[0] };
                    let newLink = { from: proposition[0], to: id, text: proposition[1] };

                    model.addNodeData(newNode);
                    model.addLinkData(newLink);

                } else {
                    node1 = { key: proposition[0], text: proposition[0] };
                    relation = { from: proposition[0], to: proposition[2], text: proposition[1] };
                    node2 = { key: proposition[2], text: proposition[2] };

                    var model = <go.GraphLinksModel>myDiagram.model;

                    model.addNodeData(node1);
                    model.addLinkData(relation);
                    model.addNodeData(node2);
                }
            }
        myDiagram.commitTransaction("new node");
    }
}