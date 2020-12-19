import React, { useState } from 'react';
import axios from 'axios'
import FadeIn from 'react-fade-in'
const baseAPI = `http://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}&s=`

function Card(props, recall, type) {
    return (
        <div className="card">
            <h3>{props.Title} - ({props.Year})</h3>
            <p></p>
            {type === "nominate" ?
                <button onClick={() => recall(props)}>Nominate</button> :
                <button onClick={() => recall(props.imdbID)}>Remove</button>
            }
        </div>
    )
}

export default function Homepage() {
    const [userQuery, setUserQuery] = useState(null);
    const [data, setQueryData] = useState(null);
    const [nominatedList, setNominatedList] = useState([]);
    const [prevQuery, setPrevQuery] = useState(null);
    const [dataCount, setDataCount] = useState(0);
    const pageLimit = 5;
    const [pageIndex, setPageIndex] = useState([]);
    const [currentPage,setCurrentPage] = useState(1);
    const [currentData, setCurrentData] = useState([]);
    const nominate = (data) => {
        setNominatedList(nominatedList.concat([data]))
    }

    const removeNominate = (imdbID) => {
        setNominatedList(nominatedList.filter(x => !(x.imdbID === imdbID)))
    }

    const apiCall = (query) => {
        axios.get(baseAPI + query)
            .then((res) => {
                const len = res.data.Search.length
                setDataCount(len);
                var maxPage = Math.floor(len / pageLimit) + 1;
                var temp = []
                var indexData = []
                for (var i = 1; i < maxPage; i++) {
                    temp.push(i);
                    indexData.push(res.data.Search.slice((i-1)*pageLimit, i * pageLimit));
                }
                setPageIndex(temp);
                setQueryData(indexData)
                setCurrentData(indexData[0])
                console.log(indexData[0])
            }).catch((err) => console.error(err))
    }

    const queryFormat = (query) => {
        return query.split(" ").join("+");
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (userQuery && !(userQuery === "")) {
            apiCall(queryFormat(userQuery))
            setPrevQuery(userQuery)
        } else {

        }

    }

    const onChangeHandler = (e) => {
        setUserQuery(e.target.value);
    }

    const changePage = (index) => {
        setCurrentPage(index);
        setCurrentData(data[index-1]);
    }

    return (
        <div className="wrapper">
            <div className="col-3 search-wrapper">
                <div>
                    <form onSubmit={submitHandler}>
                        <div className="col-8">
                            <input className="effect-9" type="text" placeholder="Look for movie ..." onChange={(e) => onChangeHandler(e)} />
                            <span className="focus-border">
                                <i></i>
                            </span>
                        </div>
                        <div className="col-2">
                            <button className="submit-button" type="submit">
                                <i className="fas fa-search"></i> Search
                            </button>
                        </div>
                    </form>
                    <div className="results">
                        {prevQuery ? <div><h4>Found {dataCount} results for <strong>"{prevQuery}"</strong></h4><hr /></div> : null}
                        <div className = "pagination">
                            {pageIndex.length > 0? 
                            pageIndex.map(x => <div className = "page-index" onClick = {() => changePage(x)}>{parseInt(x) === parseInt(currentPage)?<u>{x}</u>:x}</div>):null}
                        </div>
                        {currentData.length > 0 ? <FadeIn>{currentData.map(x => Card(x, nominate, "nominate"))}</FadeIn> : null}
                    </div>
                </div>
            </div>
            <div className="col-3">
                {nominatedList.length > 0 ? nominatedList.map(x => Card(x, removeNominate, "remove")) : "No data found"}
            </div>
        </div>
    )
}
