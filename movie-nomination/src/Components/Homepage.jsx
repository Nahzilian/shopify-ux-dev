import React, { useState } from 'react';
import axios from 'axios'
import FadeIn from 'react-fade-in'
const baseAPI = `http://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}&s=`


function Card(props, recall, type, nomList) {
    var paramCall;
    if (type === "nominate") {
        paramCall = props
    } else {
        paramCall = props.imdbID
    }
    var nominated = nomList.includes(props) ? "Nominated" : "Nominate";
    return (

        <div className="col-6">
            <FadeIn>
                <div className="card text-white bg-dark mb-3" onClick={() => recall(paramCall)}>
                    <img className="card-img-top" src={props.Poster} alt="Card image cap" />
                    <div className="content">
                        <div class="text">
                            {props.Title}<br />
                        ({props.Year})<br />
                            {type === "nominate" ? nominated : "Remove"}
                        </div>
                    </div>
                </div>
            </FadeIn>
        </div>
    )
}

export default function Homepage() {
    const [userQuery, setUserQuery] = useState(null);
    const [data, setQueryData] = useState(null);
    const [nominatedList, setNominatedList] = useState([]);
    const [prevQuery, setPrevQuery] = useState(null);
    const [dataCount, setDataCount] = useState(0);
    const pageLimit = 6;
    const [pageIndex, setPageIndex] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentData, setCurrentData] = useState([]);

    const [currentSelectedPage, setCurSelectedPage] = useState(1);
    const [currentSelectedData, setCurSelectedData] = useState([]);
    const [selectedPageIndex, setSelectedPageIndex] = useState([]);
    const nominate = (data) => {
        if (!nominatedList.includes(data)){
            var temp = nominatedList.concat([data])
            setNominatedList(temp)
            
        }
    }

    const removeNominate = (imdbID) => {
        setNominatedList(nominatedList.filter(x => !(x.imdbID === imdbID)))
    }

    const changeSelectedPage = () => {

    }

    const apiCall = (query) => {
        axios.get(baseAPI + query)
            .then((res) => {
                const len = res.data.Search.length
                setDataCount(len);
                var maxPage = Math.floor(len / pageLimit) + 2;
                var temp = []
                var indexData = []

                for (var i = 1; i < maxPage; i++) {
                    temp.push(i);
                    indexData.push(res.data.Search.slice((i - 1) * pageLimit, i * pageLimit));
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
        setCurrentData(data[index - 1]);
    }
    return (
        <div className="container">
            <br />
            <div className="col">
                <div className="row search-box">
                    <h1>The Shoppies</h1>
                    <br />
                    <form onSubmit={submitHandler}>
                        <lable><strong>Movie title</strong></lable>
                        <div className="row">
                            <div className="col-10">
                                <input className="effect-9" type="text" placeholder="Look for movie ..." onChange={(e) => onChangeHandler(e)} />
                                <span className="focus-border">
                                    <i></i>
                                </span>
                            </div>
                            <div className="col-2">
                                <button className="btn btn-info" type="submit">
                                    <span><i className="fas fa-search"></i> Search</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <br />
                <div className="search-wrapper row">
                    <div className="row">
                        <div className="col-6 left-board">
                            {prevQuery ? <div><h4>Found {dataCount} results for <strong>"{prevQuery}"</strong></h4></div> : null}
                            <div className="results">
                                <div className="paging">
                                    {pageIndex.length > 0 ?
                                        pageIndex.map(x => <div className="page-index" onClick={() => changePage(x)}>{parseInt(x) === parseInt(currentPage) ? <u className="selected">{x}</u> : x}</div>) : null}
                                </div>
                                {currentData.length > 0 ? <div className="row">{currentData.map(x => Card(x, nominate, "nominate", nominatedList))}</div> : null}
                            </div>
                        </div>
                        <div className="col-6 result-wrapper">
                            <div><h4>Nominations</h4></div>
                            <div className="paging">
                                {pageIndex.length > 0 ?
                                    pageIndex.map(x => <div className="page-index" onClick={() => changePage(x)}>{parseInt(x) === parseInt(currentSelectedPage) ? <u className="selected">{x}</u> : x}</div>) : null}
                            </div>
                            {nominatedList.length > 0 ? <div className="row">{nominatedList.map(x => Card(x, removeNominate, "remove", nominatedList))}</div> : ""}
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}
