import React, { useState, useEffect } from 'react';
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
    var listOfimdbID = nomList.map(x => x.imdbID);
    var nominated = listOfimdbID.includes(props.imdbID) ? <div className='nominated-typo'>Nominated</div> : "Nominate";
    if (props.Poster === "N/A")
        return (
            <div className="col-2">
                <FadeIn>
                    <div className="card text-white bg-dark mb-3" onClick={() => recall(paramCall)}>
                        <div className="card-body">
                            <p className="card-title">{props.Title} - ({props.Year})</p>
                        </div>
                        <div className={type === "nominate" ? "content" : "remove-nominate"}>
                            <div class="text">
                                {type === "nominate" ? nominated : "Remove"}
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        )
    return (
        <div className="col-2">
            <FadeIn>
                <div className="card text-white bg-dark mb-3" onClick={() => recall(paramCall)} style={{ backgroundImage: `url(${props.Poster})` }}>
                    <div className={type === "nominate" ? "content" : "remove-nominate"}>
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
        if (nominatedList.length > 0) {
            setIsSearched(true);
        }
    }, [nominatedList.length])
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
        <FadeIn>
            <div className="container">
                <br />
                <div className="row search-box">
                    <div className="title underline">
                        <h1>The Shoppies movie nomination</h1>
                    </div>
                    <br />
                    <form onSubmit={submitHandler}>
                        <lable><strong>Movie title</strong></lable>
                        <div className="row">
                            <div className="col-10">
                                <input className="effect-9" type="text" placeholder="Looking for movies ..." onChange={(e) => onChangeHandler(e)} />
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
                    <div>
                        <div className="result-wrapper row">
                            {prevQuery ? <div className="col-12"><h4>Found {dataCount} results for <strong>"{prevQuery}"</strong></h4></div> : null}
                            <div className="paging col-12">
                                {pageIndex.length > 0 ?
                                    pageIndex.map(x => <div className="page-index" onClick={() => changePage(x)}>{parseInt(x) === parseInt(currentPage) ? <u className="selected">{x}</u> : x}</div>) : null}
                            </div>
                            {currentData.length > 0 ?
                                <div className="col-12"><div className="row">{currentData.map(x => Card(x, nominate, "nominate", nominatedList))}</div></div> :
                                <div className="col-12 typing">
                                    <div className="typing-svg">
                                        <Typing />
                                        <p>Looking for movies!</p>
                                    </div>
                                </div>}

                        </div>
                        <br />
                        <div className="result-wrapper row">
                            {currentSelectedData.length > 0 ?
                                <div>
                                    <div className="col-12"><h4>My nomination list</h4></div>
                                    <div className="paging col-12">
                                        {selectedPageIndex.length > 0 ?
                                            selectedPageIndex.map(x => <div className="page-index" onClick={() => changeSelectedPage(x)}>{parseInt(x) === parseInt(currentSelectedPage) ? <u className="selected">{x}</u> : x}</div>) : null}
                                    </div>
                                </div> : null}
                            {currentSelectedData.length > 0 ?
                                <div className="col-12"><div className="row">{currentSelectedData.map(x => Card(x, removeNominate, "remove", nominatedList))}</div></div> :
                                <div className="col-12 empty-clip">
                                    <div className="clip-board">
                                        <EmptyClip />
                                        <p>Huh, your nomination list looks empty...</p>
                                    </div>
                                </div>}
                        </div>
                    </div>
                    :
                    <div className="main-page row">
                        <div className="col-6">
                            <Award />
                        </div>
                        <div className="col-6">
                            <h2 className="title underline">Movie nominations</h2>
                            <br />
                            <p>Love watching movies? Want to nominate your favourite film? The Shoppies movie nomination a solution for you!</p>
                            <ul>
                                <li>Can't keep track of your nominees? We got you covered!</li>
                                <li>Look up for your favorite movies within seconds!</li>
                                <li>Save your nominees for future reference!</li>
                            </ul>
                        </div>
                    </div>}
                <br />
            </div >
        </FadeIn>
    )
}
