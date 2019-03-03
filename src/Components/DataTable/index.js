import React, { Component } from 'react';
import './datatable.css';
import ReactDOM from 'react-dom';
import Pagination from '../Pagination';
class DataTable extends React.Component{
    constructor(props){
        super(props);
        this.state={
            headers:props.headers,
            data:props.data,
            sortBy:null,
            descending:null,
            search:false,
            pageLength: this.props.pagination.pageLength || 5,
            currentPage:1
        }
        this.keyField=props.keyField || "id";
        this.noData=props.noData || "No Records Found";
        this.width=props.width ||  "100%";

        //Add pagination support
        this.pagination = this.props.pagination || {};
    }
    onDragOver = (e) => {
        e.preventDefault();
    }

    onDragStart = (e, source) => {

        console.log('source',source);
        e.dataTransfer.setData('text/plain', source);
        console.log('e',e);
    }
    onDrop = (e, target) => {
        e.preventDefault();
        let source = e.dataTransfer.getData('text/plain');
        let headers = [...this.state.headers];

        let srcHeader =  headers[source];
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
        let data =  this.state.data;

        console.log('God',this.pagination);
        console.log('God1',this.state.pagedData);
        console.log('God2',this.state.data);
        console.log('God4',data);
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
    onSearch = (e) => {
        let { headers } = this.state;
        // Grab the index of the target column
        let idx = e.target.dataset.idx;

        // Get the target column
        let targetCol = this.state.headers[idx].accessor;

        let data = this._preSearchData;

        // Filter the records
        let searchData = this._preSearchData.filter((row) => {
            let show = true;

            for (let i = 0; i < headers.length; i++) {
                let fieldName = headers[i].accessor;
                let fieldValue = row[fieldName];
                let inputId = 'inp' + fieldName;
                let input = this[inputId];
                if (!fieldValue === '') {
                    show = true;
                } else {
                    show = fieldValue.toString().toLowerCase().indexOf(input.value.toLowerCase()) > -1;
                    if (!show) break;
                }
            }
            return show;
            //return row[targetCol].toString().toLowerCase().indexOf(needle) > -1;
        });

        // UPdate the state
        this.setState({
            data: searchData,
            pagedData: searchData,
            totalRecords: searchData.length
        }, () => {
            // if (this.pagination.enabled) {
            //     this.onGotoPage(1);
            // }
        });
    }

    renderSearch =()=>{
        let {search,headers}= this.state;
        if(!search) return null;

        let searchInputs = headers.map(( header,idx)=>{
            let hdr = this[header.accessor];
            let inputId = 'inp'+ header.accessor;

            return(
                <td key={idx}>
                 <input
                    ref={(input) => this[inputId] = input}
                    type="text"
                    data-idx={idx}
                    style={{
                        width:hdr.clientWidth -17 +"px"
                    }}
                    />
                </td>
            )
        });
        return(
           <tr onChange= {this.onSearch}>
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
            {this.pagination.enabled  &&
                <Pagination
                  type ={this.props.pagination.type}
                  totalRecords ={this.state.data.length}
                  pageLength ={this.state.pageLength}

                 />
            }
            <br></br>
             {this.renderToolBar()}
             {this.renderTable()}
          </div>
        );
    }


}

export default DataTable;
