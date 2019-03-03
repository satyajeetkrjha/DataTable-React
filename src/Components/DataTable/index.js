import React, { Component } from 'react';
import './datatable.css';
import ReactDOM from 'react-dom';

class DataTable extends React.Component{
    constructor(props){
        super(props);
        this.state={
            headers:props.headers,
            data:props.data,
            sortBy:null,
            descending:null,
            search:false
        }
        this.keyField=props.keyField || "id";
        this.noData=props.noData || "No Records Found";
        this.width=props.width ||  "100%";
    }
    onDragOver = (e) => {
        e.preventDefault();
    }

    onDragStart = (e, source) => {


        e.dataTransfer.setData('text/plain', source);
    }
    onDrop = (e, target) => {
        e.preventDefault();
        let source = e.dataTransfer.getData('text/plain');
        let headers = [...this.state.headers];
        let srcHeader = headers[source];
        console.log('headers',headers);
        let targetHeader = headers[target];

        let temp = srcHeader.index;
        srcHeader.index = targetHeader.index;
        targetHeader.index = temp;

        this.setState({
            headers
        });
    }

    renderTableHeader =()=>{
         let {headers}=this.state;

         headers.sort((a,b)=>{
             if(a.index>b.index)
               return 1;
               return -1;

         })
         let headerView =headers.map ((header,index)=>{
               let title =header.title;
               let cleanTitle =header.accessor;
               let width =header.width;
               if(this.state.sortBy === index){
                   title  += this.state.descending ? '\u2193':'\u2191'
               }
               return (
                     <th
                        key ={cleanTitle}
                        ref={(th)=> this[cleanTitle] =th}
                        style={{width:width}}
                        datacol={cleanTitle}
                        onDragStart ={(e)=>this.onDragStart(e ,index)}
                        onDragOver={this.onDragOver}
                        onDrop={(e)=>this.onDrop(e ,index)}
                        >
                        <span draggable  className="header-cell">
                         {title}
                        </span>
                        </th>
               );

         });
         return headerView;
    }
    renderNoData =()=>{
        return(
            <tr>
               <td colSpan={this.props.headers.length}>
                  {this.noData}
                </td>
            </tr>
        );
    }
    onSort =(e)=>{
        let data =this.state.data.slice();// lol get a new array
        let colIndex =ReactDOM.findDOMNode(e.target).parentNode.cellIndex;
        let colTitle = e.target.parentNode.attributes.datacol.value;
        let descending =  !this.state.descending;

          data.sort((a,b)=>{
              let sortVal = 0;// neither ascending nor descending
              if(a[colTitle]<b[colTitle]){
                  sortVal=-1;
              } else if(a[colTitle]>b[colTitle]){
                  sortVal=1;
              }
              if(descending){
                  sortVal=sortVal*-1;
              }
              return sortVal;

          })

          this.setState({
              data,
              sortBy:colIndex,
              descending
          });


    }
    renderContent = () => {
        let { headers } = this.state;
        let data = this.pagination ? this.state.pagedData
            : this.state.data;

        let contentView = data.map((row, rowIdx) => {
            let id = row[this.keyField];
            let edit = this.state.edit;

            let tds = headers.map((header, index) => {
                let content = row[header.accessor];
                let cell = header.cell;
                if (cell) {
                    if (typeof (cell) === "object") {
                        if (cell.type === "image" && content) {
                            content = <img style={cell.style} src={content} />
                        }
                    } else if (typeof (cell) === "function") {
                        content = cell(row);
                    }
                }

                if (this.props.edit) {
                    if (header.dataType && (header.dataType === "number" ||
                        header.dataType === "string") &&
                        header.accessor !== this.keyField) {
                        if (edit && edit.row === rowIdx && edit.cell === index) {
                            content = (
                                <form onSubmit={this.onUpdate}>
                                    <input type="text" defaultValue={content}
                                        onKeyUp={this.onFormReset} />
                                </form>
                            );
                        }

                    }
                }

                return (
                    <td key={index} data-id={id} data-row={rowIdx}>
                        {content}
                    </td>
                );
            });
            return (
                <tr key={rowIdx}>
                    {tds}
                </tr>
            );
        });
        return contentView;
    }
    renderSearch =()=>{
        let {search,headers}= this.state;
        if(!search) return null;

        let searchInputs = headers.map(( header,idx)=>{
            let hdr = this[header.accessor];
            return(
                <td key={idx}>
                 <input type="text" data-idx={idx}/>
                </td>
            )
        });
        return(
           <tr>
              {searchInputs}
           </tr>

        );
    }

    renderTable =()=>{
        let title = this.props.title || "DataTable";
        let headerView =this.renderTableHeader();
        let contentView = this.state.data.length  >0 ?
                          this.renderContent():
                          this.renderNoData()

        return(
            <table className="data-inner-table">
               <caption className="data-table-caption">
                 {title}
               </caption>
               <thead onClick ={this.onSort}>
                    <tr>
                      {headerView}
                    </tr>
               </thead>
               <tbody>
                  {this.renderSearch()}
                  {contentView}
               </tbody>
            </table>

        );
    }
    onToggleSearch =(e)=>{
       if(this.state.search){
           this.setState({
               data:this._preSearchData,
               search:false

           });
           this._preSearchData=null;
       }
       else{
           this._preSearchData=this.state.data;
           this.setState({
               search:true
           });
       }
    }
    renderToolBar =()=>{
        return(
            <div className="toolbar">
             <button  onClick ={this.onToggleSearch}> Search</button>
            </div>
        );
    }
    render(){
        return(
          <div className={this.props.className}>
             {this.renderToolBar()}
             {this.renderTable()}
          </div>
        );
    }


}

export default DataTable;
