import React, {Fragment, Component } from 'react';
import ReactDOM from 'react-dom';
import './pagination.css';
class Pagination extends React.Component {
    constructor(props){
        super(props);
        this.currentPage=1;
        this.pageLength =props.pageLength;

    }
    render(){
        let pageSelector =(
          <Fragment key="f-page-selector">
               <span key="page-selector" className="page-selector">
                 Rows per page
               </span>
          </Fragment>

         );
        return(
             <div className="pagination">
                {
                    [pageSelector]
                }
             </div>

        );
    }
}
export default Pagination;
