import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Cheerio from 'cheerio';
import { Observable } from 'rxjs';
// const Cheerio = require('Cheerio');
const tagstoTrack = [
  'span',
  'input',
  'button',
  'a',
  'select',
  'ul',
  'li',
  'div',
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  mode = 1;
  title = 'client';
  data: any[] = [];
  diffData: any[] = [];
  selectedPage: any;
  _showSpinner = false;
  _selectedTabIndex = 0;
  _defaultElementToCrawl: any[] = [
    { tag: 'span', title: 'All span elements' },
    { tag: 'input', title: 'All input elements' },
    { tag: 'button', title: 'All button elements' },
    { tag: 'a', title: 'All link elements' },
  ];

  elementNames: any[] = this._defaultElementToCrawl;

  pageNames: any[] = [];
  applications: any[] = [
    { name: 'Camunda', id: 1 },
    { name: 'App 2', id: 2 },
  ];
  selectedOptions: any;
  constructor(private httpClient: HttpClient) {}
  ngOnInit() {
    this.crawlHtml(
      `<div><span class='c1'></span></div>`,
      `<div><span class='c2'></span></div>`
    );
  }
  openImage(event: any, element: any) {
    if (element.screenshotName) {
      window.open(`./assets/${element.screenshotName}`, '_blank');
    }
    event.stopPropagation();
    event.preventDefault();
  }
  processURL() {
    this._showSpinner = true;
    this.httpClient
      .get('http://localhost:8081/crawl/application/123')
      .subscribe((data: any) => {
        // console.log(data);
        this._showSpinner = false;
        this.data = data.pageIdentifierList;
        this.diffData = data.pageDifflist;
        this.pageNames = this.data.map((d: any) => {
          return { id: d.pageName, name: d.pageName };
        });
        this.selectedPage = this.pageNames[0].id;
      });
  }
  getDomElementsOfType(name: string) {
    const pageIdentifiers = this.data.find(
      (a) => a.pageName === this.selectedPage
    )?.identifiers;
    return (pageIdentifiers || []).filter(
      (d: any) => d.name === name && d.identifier
    );
  }
  tabChange(args: any) {
    if (args.index === 1) {
      const pageIdentifiers = this.diffData.find(
        (a) => a.pageName === this.selectedPage
      )?.identifiers;
      const uniqueTags = [
        ...new Set((pageIdentifiers || []).map((d: any) => d.name)),
      ];
      this.elementNames = uniqueTags.map((d: any) => {
        return {
          tag: d,
          title: `All ${d} elements`,
        };
      });
    } else {
      this.elementNames = this._defaultElementToCrawl;
    }
    this._selectedTabIndex = args.index;
  }
  getDiffDomElementsOfType(name: string) {
    console.log(this.diffData);
    const pageIdentifiers = this.diffData.find(
      (a) => a.pageName === this.selectedPage
    )?.identifiers;
    return (pageIdentifiers || []).filter(
      (d: any) => d.name === name && d.identifier
    );
  }
  getDiffTags() {
    const pageIdentifiers = this.diffData.find(
      (a) => a.pageName === this.selectedPage
    )?.identifiers;
    return [
      ...new Set(
        (pageIdentifiers || []).map((d: any) => {
          return {
            tag: d.name,
            title: `All ${d.name} elements`,
          };
        })
      ),
    ];
  }

  onAreaListControlChanged(list: any) {
    this.selectedOptions = list.selectedOptions.selected.map(
      (item: any) => item.value
    );
  }
  copyAllSelectedItems() {
    if (!this.selectedOptions?.length) {
      alert('No records selected!');
      return;
    }
    this.copyToClipboard(this.selectedOptions.join('<br>'));
  }
  copyToClipboard(textContent: string) {
    var brRegex = /<brs*[/]?>/gi;
    navigator.clipboard.writeText(textContent.replace(brRegex, '\r\n'));
  }
  /**test */

  crawlHtml(html1: any, html2: any) {
    const dataArray: any[] = [];
    const dom1 = this.getDOMJSON(html1);
    const dom2 = this.getDOMJSON(html2);
    const difference = dom2.filter(
      (e1) => !dom1.find((e2) => e2.identifier === e1.identifier)
    );
    console.log(difference);
    // fs.writeFile(
    //   `output.json-${Date.now()}`,
    //   JSON.stringify(dataArray),
    //   'utf8',
    //   function (err: any) {
    //     if (err) {
    //       console.log('An error occured while writing JSON Object to File.');
    //       return console.log(err);
    //     }

    //     console.log('JSON file has been saved.');
    //   }
    // );
  }
  getDOMJSON(html: any) {
    const dataArray: any[] = [];
    const root = Cheerio.load(html);
    tagstoTrack.forEach((t) => {
      const selectedObjects = root(t);
      selectedObjects.each((index: number, element: any) => {
        let identifier = this.getUniqueIdentifier(root, element);
        const objectWithIdentifier = dataArray.find(
          (d) => d.identifier === identifier
        );
        if (!objectWithIdentifier) {
          dataArray.push({
            identifier: identifier,
            type: element.type,
            name: element.name,
            count: 1,
            // attr: JSON.stringify(element.attr),
            // text: root(element).text(), // get the text
            // href: root(element).attr('class'), // get the href attribute
          });
        } else {
          objectWithIdentifier.count++;
        }
      });
    });
    return dataArray;
  }
  getUniqueIdentifier($Cheerio: any, node: any) {
    let identifier = '';

    if (node.type && node.name && $Cheerio(node).attr) {
      console.log($Cheerio(node).html());
      if ($Cheerio(node).attr('id')) {
        identifier = `#${$Cheerio(node).attr('id')}`;
      } else {
        if ($Cheerio(node).attr('type')) {
          identifier = `[type=${$Cheerio(node).attr('type')}]`;
        }
        if ($Cheerio(node).attr('class')) {
          let classArray = $Cheerio(node).attr('class').split(' ');
          classArray = classArray.filter((c: any) => {
            return !c.startsWith('ng-');
          });
          const classString = classArray.join('.');
          identifier = classString
            ? `${identifier}.${classArray.join('.')}`
            : identifier;
        }
        if ($Cheerio(node).attr('href')) {
          identifier = `${identifier}[href="${$Cheerio(node).attr('href')}"]`;
        }
        if (identifier) {
          identifier = `${node.name}${identifier}`;
          if (node.parent && node.parent.name) {
            identifier = `${node.parent.name} ${identifier}`;
          }
        }
      }
    }
    console.log(identifier);
    return identifier;
  }

  buildHtml(dataArray: any[]) {
    const html = `<html>
  <head>   
      <style>
     .tag-name-header{
         background:#e4e4e4;
         padding:5px;
     }
     .count-note{
      color:red;
      margin-left: 100px;
    }
     ul{
      list-style:none;
     }
      </style>
      <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
  </head>
  <body>
  <div><button class="action-buttons" onclick="copyAllSelectedItems()">Copy Selected Items</button></div>
      #bodyContent
  </body>
  <script>
  function copyToClipboard(textContent) {
    var $temp = $("<textarea>");
    var brRegex = /<br\s*[\/]?>/gi;    
    navigator.clipboard.writeText(textContent.replace(brRegex, "\\r\\n"));
  }
  function copyAllSelectedItems(){
    /* Copy the text inside the text field */
    let copiedItemArray=[];
   
    let checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    if(!checkedBoxes?.length){
        alert('No records selected!');
        return;
    } 
    checkedBoxes.forEach(c=>{if(c.labels[0].textContent){copiedItemArray.push(c.labels[0].textContent.trim())}});
    copyToClipboard(copiedItemArray.join('<br>'))
  } 
 
  </script>
</html>`;
    let bodyHtml = '';

    let headerTemplate = `<div><p class='tag-name-header'>#val</p>#allTags</div>`;
    let counter = 1;
    tagstoTrack.forEach((e) => {
      const fiteredItems = dataArray.filter((d) => d.name === e);
      if (fiteredItems.length) {
        let headerHtml = headerTemplate.replace(
          '#val',
          `  All ${e === 'a' ? 'link' : e} elements`
        );
        let listItems = '';
        fiteredItems.forEach((s) => {
          const checkBoxId = `item${counter}`;
          if (s.identifier) {
            const countHtml =
              s.count > 1
                ? `<span class='count-note'>multiple elements found with this selector(${s.count} elements found)</span`
                : '';
            listItems =
              listItems +
              ` <li><input type="checkbox" id="${checkBoxId}" name="${checkBoxId}" value="${s.identifier}">
          <label for="${checkBoxId}"> ${s.identifier}</label>${countHtml} </li>`;
            // listItems = listItems + `<li><span${s.identifier} </span><input type="checkbox"/></li>`
          }
          counter = counter + 1;
        });
        bodyHtml =
          bodyHtml + headerHtml.replace('#allTags', `<ul>${listItems}</ul>`);
      }
    });
  }
}
interface CrawlerResponse {
  pageIdentifierList: any[];
  pageDifflist: any[];
}
interface DomElement {
  name: string;
  type: string;
  identifier: string;
  attr: string;
}
