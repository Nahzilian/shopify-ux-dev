import React, { useState,useEffect } from 'react';
import axios from 'axios'
import FadeIn from 'react-fade-in'
import { ReactComponent as Award } from './assets/award.svg'
import { ReactComponent as EmptyClip } from './assets/clip.svg'
import { ReactComponent as Typing } from './assets/typing.svg'
const baseAPI = `http://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}&s=`


function Card(props, recall, type, nomList) {
    var paramCall;
    if (type === "nominate") {
        paramCall = props
    } else {
        paramCall = props.imdbID
    }
    var nominated = nomList.includes(props) ? "Nominated" : "Nominate";
    if (props.Poster === "N/A")
        return (
            <div className="col-6">
                <FadeIn>
                    <div className="card text-white bg-dark mb-3" onClick={() => recall(paramCall)}>
                        <div className="card-body">
                            <h5 className="card-title">{props.Title} - ({props.Year})</h5>
                        </div>
                        <div className="content">
                            <div class="text">
                                {type === "nominate" ? nominated : "Remove"}
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        )
    return (
        <div className="col-6">
            <FadeIn>
                <div className="card text-white bg-dark mb-3" onClick={() => recall(paramCall)}>
                    <img className="card-img-top" src={props.Poster} alt="Movie poster" />
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
    const [nominatedList, setNominatedList] = useState(JSON.parse(localStorage.getItem("nominatedList")) || []);
    const [prevQuery, setPrevQuery] = useState(null);
    const [dataCount, setDataCount] = useState(0);
    const pageLimit = 6;
    const [pageIndex, setPageIndex] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentData, setCurrentData] = useState([]);
    const [currentSelectedPage, setCurSelectedPage] = useState(JSON.parse(localStorage.getItem("currentSelectedPage")) || 1);
    const [currentSelectedData, setCurSelectedData] = useState(JSON.parse(localStorage.getItem("currentSelectedData")) || []);
    const [selectedPageIndex, setSelectedPageIndex] = useState(JSON.parse(localStorage.getItem("selectedPageIndex")) || [1]);
    const [isSearched, setIsSearched] = useState(false);
    
    window.onbeforeunload = () => {
        localStorage.setItem("currentSelectedData", JSON.stringify(currentSelectedData));
        localStorage.setItem("selectedPageIndex", JSON.stringify(selectedPageIndex));
        localStorage.setItem("nominatedList", JSON.stringify(nominatedList));
        localStorage.setItem("currentSelectedPage", JSON.stringify(currentSelectedPage));
    }
    useEffect(() => {
        if(nominatedList.length > 0){
            setIsSearched(true);
        }
    },[])
    const nominate = (data) => {
        var compareElement = data.imdbID;
        var listOfimdbID = nominatedList.map(x => x.imdbID);
        if (!listOfimdbID.includes(compareElement)) {
            var temp = nominatedList.concat([data]);
            var maxPage;
            if (temp.length % pageLimit === 0) {
                maxPage = Math.floor(temp.length / pageLimit);
            } else {
                maxPage = Math.floor(temp.length / pageLimit) + 1;
            }
            var index;
            var lastElement = selectedPageIndex[selectedPageIndex.length - 1]
            if (lastElement === maxPage) {
                index = lastElement
            } else if (lastElement < maxPage) {
                index = maxPage;
                setSelectedPageIndex(selectedPageIndex.concat(index));
            }
            setNominatedList(temp);
            setCurSelectedData(temp.slice((index - 1) * pageLimit, index * pageLimit));
            setCurSelectedPage(index)
        }
    }
    const removeNominate = (imdbID) => {
        var temp = nominatedList.filter(x => !(x.imdbID === imdbID));
        setNominatedList(temp);
        var maxPage;
        if (temp.length % pageLimit === 0) {
            selectedPageIndex.pop();
            if (selectedPageIndex.length === 0) {
                setSelectedPageIndex([1]);
            }
            maxPage = Math.floor(temp.length / pageLimit);
            setCurSelectedPage(maxPage)
            setCurSelectedData(temp.slice((maxPage - 1) * pageLimit, maxPage * pageLimit));
        } else {
            maxPage = Math.floor(temp.length / pageLimit) + 1;
            var lastElement = selectedPageIndex[selectedPageIndex.length - 1];
            if (lastElement > maxPage) {
                selectedPageIndex.pop()
                if (selectedPageIndex.length === 0) {
                    setSelectedPageIndex([1]);
                }
            }
            setCurSelectedData(temp.slice((currentSelectedPage - 1) * pageLimit, currentSelectedPage * pageLimit));
        }

    }

    const changeSelectedPage = (index) => {
        setCurSelectedPage(index);
        setCurSelectedData(nominatedList.slice((index - 1) * pageLimit, index * pageLimit))
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
                setIsSearched(true)
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
            <FadeIn>
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
                    {isSearched ?
                        <div className="search-wrapper row">
                            <div className="row">
                                <div className="col-6 left-board">
                                    {prevQuery ? <div><h4>Found {dataCount} results for <strong>"{prevQuery}"</strong></h4></div> : null}
                                    <div className="results">
                                        <div className="paging">
                                            {pageIndex.length > 0 ?
                                                pageIndex.map(x => <div className="page-index" onClick={() => changePage(x)}>{parseInt(x) === parseInt(currentPage) ? <u className="selected">{x}</u> : x}</div>) : null}
                                        </div>
                                        {currentData.length > 0 ? <div className="row">{currentData.map(x => Card(x, nominate, "nominate", nominatedList))}</div> :
                                            <div><Typing /></div>}
                                    </div>
                                </div>
                                <div className="col-6 result-wrapper">
                                    <div><h4>Nominations</h4></div>
                                    <div className="paging">
                                        {selectedPageIndex.length > 0 ?
                                            selectedPageIndex.map(x => <div className="page-index" onClick={() => changeSelectedPage(x)}>{parseInt(x) === parseInt(currentSelectedPage) ? <u className="selected">{x}</u> : x}</div>) : null}
                                    </div>
                                    {currentSelectedData.length > 0 ? <div className="row">{currentSelectedData.map(x => Card(x, removeNominate, "remove", nominatedList))}</div> :
                                        <div>
                                            <EmptyClip />
                                        </div>}
                                </div>
                            </div>
                        </div> :
                        <div className="search-wrapper row">
                            <div className="col-6">
                                <Award />
                            </div>
                            <div className="col-6">
                                <h1>Time for some query</h1>
                            </div>
                        </div>

                    }
                </div>
            </FadeIn>
        </div>
    )
}
