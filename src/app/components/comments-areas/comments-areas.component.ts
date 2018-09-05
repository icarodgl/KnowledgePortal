import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-comments-areas',
  templateUrl: './comments-areas.component.html',
  styleUrls: ['./comments-areas.component.scss']
})
export class CommentsAreasComponent implements OnInit {
    private displayRespondeOf:Number = -1;
    private responseTo:String = "";

    private comments:any[] = [
      {
        author: {
          name: "Wagner Perin",
          img: "./assets/img/faces/wagner.jpg",
          date: "7 minutes ago"
        },
        content: "Chance too good. God level bars. I'm so proud of @LifeOfDesiigner #1 song in the country. Panda! Don't be scared of the truth because we need to restart the human foundation in truth I stand with the most humility. We are so blessed! All praises and blessings to the families of people who never gave up on dreams. Don't forget, You're Awesome!",
        responses:[
          {
            author: {
              name: "Mark Zuckerberg",
              img: "./assets/img/faces/marc.jpg",
              date: "19 minutes ago"
            },
            content: "Chance too good. God level bars. I'm so proud of @LifeOfDesiigner #1 song in the country. Panda! Don't be scared of the truth because we need to restart the human foundation in truth I stand with the most humility. We are so blessed! All praises and blessings to the families of people who never gave up on dreams. Don't forget, You're Awesome!",
          }
        ]
      }
    ];
    constructor() { }
    
    ngOnInit() {
    }

    reply(n, name){
      this.displayRespondeOf = n;
      name ? this.responseTo = "@"+name:"";
    }

}