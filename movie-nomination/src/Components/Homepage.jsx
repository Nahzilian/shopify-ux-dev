import React, { useState, useEffect } from 'react';
import axios from 'axios'
import FadeIn from 'react-fade-in'
import { ReactComponent as Award } from './assets/award.svg'
import { ReactComponent as EmptyClip } from './assets/clip.svg'
import { ReactComponent as Typing } from './assets/typing.svg'
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

/*
* Base API variable for requesting data
*/
const baseAPI = `https://www.omdbapi.com/?apikey=${process.env.REACT_APP_API_KEY}&s=`

/* Function for checking unique items in a list */
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

/* Alert template for Material UI snackbar */
function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
/* 
* Card component to display information about the movies (i.e. Title, year, poster/image) 
* - Depends on the mapping on the items, the display is based on the type of object (if the item is in nominated list or not)
* Since imdbID will always be unique, it will be used to check the availability within a list
*/
function Card(props, recall, type, nomList) {
    var paramCall;
    if (type === "nominate") {
        paramCall = props
    } else {
        paramCall = props.imdbID
    }
    const imgStyle = {
        backgroundImage: `url(${props.Poster})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    }
    var listOfimdbID = nomList.map(x => x.imdbID);
    var nominated = listOfimdbID.includes(props.imdbID) ? <div className='nominated-typo'>Nominated</div> : "Choose";
    if (props.Poster === "N/A")
        return (
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
                <FadeIn>
                    <div className="card text-white bg-dark mb-3" onClick={() => recall(paramCall)}>
                        <div className="card-body">
                            <p className="card-title">{props.Title} - ({props.Year})</p>
                        </div>
                        <div className={type === "nominate" ? "content" : "remove-nominate"}>
                            <div className="text">
                                {type === "nominate" ? nominated : "Remove"}
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        )
    return (
        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
            <FadeIn>
                <div className="card text-white bg-dark mb-3" onClick={() => recall(paramCall)} style={imgStyle}>
                    <div className="card-body">
                        <p className="card-title">{props.Title} - ({props.Year})</p>
                    </div>
                    <div className={type === "nominate" ? "content" : "remove-nominate"}>
                        <div className="text">
                            {type === "nominate" ? nominated : "Remove"}
                        </div>
                    </div>
                </div>
            </FadeIn>
        </div>
    )
}

/* 
* Homepage function
*/
export default function Homepage() {
    /* 
    * All hooks for storing/representing/displaying data
    */
    const [open, setOpen] = useState(false);
    const [userQuery, setUserQuery] = useState(null);
    const [originalData, setOriginalData] = useState([]);
    const [data, setQueryData] = useState(null);
    const [nominatedList, setNominatedList] = useState(JSON.parse(localStorage.getItem("nominatedList")) || []);
    const [prevQuery, setPrevQuery] = useState(null);
    const [dataCount, setDataCount] = useState(0);
    const [listOfYears, setListOfYears] = useState([]);
    const pageLimit = 4;
    const [pageIndex, setPageIndex] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentData, setCurrentData] = useState([]);
    const [currentSelectedPage, setCurSelectedPage] = useState(JSON.parse(localStorage.getItem("currentSelectedPage")) || 1);
    const [currentSelectedData, setCurSelectedData] = useState(JSON.parse(localStorage.getItem("currentSelectedData")) || []);
    const [selectedPageIndex, setSelectedPageIndex] = useState(JSON.parse(localStorage.getItem("selectedPageIndex")) || [1]);
    const [isSearched, setIsSearched] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [stateMessage, setStateMsg] = useState(JSON.parse(localStorage.getItem("nominatedList"))? JSON.parse(localStorage.getItem("nominatedList")).length > 0 ? 1 : 0: 0);
    /* 
    * Before unload the page/ close the page, it will store the data to the localStorage
    */
    window.onbeforeunload = () => {
        localStorage.setItem("currentSelectedData", JSON.stringify(currentSelectedData));
        localStorage.setItem("selectedPageIndex", JSON.stringify(selectedPageIndex));
        localStorage.setItem("nominatedList", JSON.stringify(nominatedList));
        localStorage.setItem("currentSelectedPage", JSON.stringify(currentSelectedPage));
    }
    /* Check if there was a saved nomination list, if yes open snackbar */
    window.onload = () => {
        if (stateMessage === 1) {
            handleClick()
        }
    }

    /* Check if there was a saved nomination list, if yes define isSearch to true */
    useEffect(() => {
        if (nominatedList.length > 0) {
            setIsSearched(true);
        }

    }, [nominatedList.length])


    /* 
    Snackbar helper functions 
     - handleClick : open snackbar
     - handleClose : close snackbar
    */
    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    /* On demand saving data */
    const saveAllData = () => {
        localStorage.setItem("currentSelectedData", JSON.stringify(currentSelectedData));
        localStorage.setItem("selectedPageIndex", JSON.stringify(selectedPageIndex));
        localStorage.setItem("nominatedList", JSON.stringify(nominatedList));
        localStorage.setItem("currentSelectedPage", JSON.stringify(currentSelectedPage));
        handleClick();
    }
    /* 
    Nominate function: 
    - Check for the movie availability based on imdbID
    - Recalculate pagination
    - Re-distribute data
    */
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
            setCurSelectedPage(index);
        }
    }
    /* 
    Remove nominate function: 
    - Recalculate pagination
    - Re-distribute data
    */
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

    /* 
    On demand page selection:
    - Change current page value
    - Re-distribute data
    */
    const changeSelectedPage = (index) => {
        setCurSelectedPage(index);
        setCurSelectedData(nominatedList.slice((index - 1) * pageLimit, index * pageLimit))
    }

    /* 
    API call function
    Handle response, if there is data being returned, proceed to distribute data, else open error snackbar and skip operation
    */
    const apiCall = (query) => {
        var reformat = queryFormat(query)
        axios.get(baseAPI + reformat)
            .then((res) => {
                try {
                    if (res.data.Error) {
                        handleClick();
                        setStateMsg(0);
                    } else {
                        setOriginalData(res.data.Search);
                        const len = res.data.Search.length
                        setDataCount(len);
                        var maxPage = Math.floor(len / pageLimit) + 2;
                        var temp = []
                        var indexData = []
                        var yearList = res.data.Search.map(x => x.Year).filter(onlyUnique);
                        yearList.sort();
                        for (var i = 1; i < maxPage; i++) {
                            temp.push(i);
                            indexData.push(res.data.Search.slice((i - 1) * pageLimit, i * pageLimit));
                        }
                        setPageIndex(temp);
                        setQueryData(indexData);
                        setCurrentData(indexData[0]);
                        setIsSearched(true);
                        setListOfYears(yearList)
                        setPrevQuery(query);
                        setCurrentPage(1);
                    }
                }
                catch (err) {
                    console.error(err);
                    handleClick();
                    setStateMsg(0);
                }
            }).catch((err) => {
                console.error(err);
                handleClick();
                setStateMsg(0);
            })
    }
    /** 
     * @param {*} query 
     * Reformat the query for API call
     */
    const queryFormat = (query) => {
        return query.split(" ").join("+");
    }

    /**
     * Handle on-submit action of the form.
     * Request data from API
     * @param {*} e 
     */
    const submitHandler = (e) => {
        e.preventDefault();
        if (userQuery && !(userQuery === "")) {
            apiCall(userQuery)
        }
    }
    /**
         * Handle on-change event of the input box
         * @param {*} e 
         */
    const onChangeHandler = (e) => {
        setUserQuery(e.target.value);
    }
    /**
         * Handle onclick event of pagination
         * @param {*} e 
         */
    const changePage = (index) => {
        setCurrentPage(index);
        setCurrentData(data[index - 1]);
    }
    /**
     * Filter returned data by year
     * @param {*} year 
     */
    const filterDataByYear = (year) => {
        var filteredList;
        if (year === "Years") {
            setSelectedYear("All records");
            filteredList = originalData;
        } else {
            setSelectedYear(year);
            filteredList = originalData.filter(movie => movie.Year === year);
        }
        var len = filteredList.length;
        setDataCount(len);
        var maxPage = Math.floor(len / pageLimit) + 2;
        var temp = []
        var indexData = []
        for (var i = 1; i < maxPage; i++) {
            temp.push(i);
            indexData.push(filteredList.slice((i - 1) * pageLimit, i * pageLimit));
        }
        setPageIndex(temp);
        setQueryData(indexData);
        setCurrentData(indexData[0]);
        setIsSearched(true);
    }
    /**
     * Main content
     */
    return (
        <FadeIn>
            <div className="container">
                <br />
                <div className="row search-box">
                    <div className="title underline">
                        <h1>The Shoppies: Movie awards for entrepreneurs</h1>
                    </div>
                    <br />
                    <form onSubmit={submitHandler}>
                        <label><strong>Movie title</strong></label>
                        <div className="row">
                            <div className="col-xl-10 col-lg-10 col-md-8">
                                <input className="input-effect" type="text" placeholder="Looking for movies ..." onChange={(e) => onChangeHandler(e)} />
                                <span className="focus-border">
                                    <i></i>
                                </span>
                            </div>
                            <div className="col-xl-2 col-lg-2 col-md-4">
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
                            {prevQuery ?
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-xl-10 col-lg-8 col-md-8"><h4>Found {dataCount} results for <strong>"{prevQuery}"</strong></h4></div>
                                        <div className="col-xl-2 col-lg-4 col-md-4">
                                            <div className="dropdown">
                                                <button className="btn btn-info dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    {selectedYear || "Filter by year"}
                                                </button>
                                                {listOfYears.length > 0 ?
                                                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                        <a className="dropdown-item" href="#" onClick={() => filterDataByYear("Years")}>All recorded years</a>
                                                        {listOfYears.map(x =>
                                                            selectedYear === x ?
                                                                <a className="dropdown-item active" href="#" onClick={() => filterDataByYear(x)}>{x}</a> :
                                                                <a className="dropdown-item" href="#" onClick={() => filterDataByYear(x)}>{x}</a>)
                                                        }
                                                    </div> :
                                                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                        <a className="dropdown-item" href="#">No record found!</a>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div> : null}
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
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="row">
                                                <div className="col-xl-10 col-lg-8 col-md-8">
                                                    <h4>My nomination list (<span style={{ color: "red" }}>{nominatedList.length}</span> nominees)</h4>
                                                </div>
                                                <div className="col-xl-2 col-lg-4 col-md-4">
                                                    <button className="btn btn-info" onClick={() => saveAllData()}>
                                                        <span><i class="far fa-save"></i> Save</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="paging col-12">
                                            {selectedPageIndex.length > 0 ?
                                                selectedPageIndex.map(x => <div className="page-index" onClick={() => changeSelectedPage(x)}>{parseInt(x) === parseInt(currentSelectedPage) ? <u className="selected">{x}</u> : x}</div>) : null}
                                        </div>
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
                        <div className="col-6 award">
                            <Award />
                        </div>
                        <div className="col-12  col-sm-12 col-md-12 col-lg-6 col-xl-6  landing-context">
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
            <Snackbar open={open}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={5000}
                onClose={handleClose}
            >
                <Alert severity={stateMessage === 0 ? "error" : "info"} onClose={handleClose}>
                    {stateMessage === 0 ? "Something went wrong, please try again later!" :
                        "Phew, your nomination list is safe with us "}
                </Alert>
            </Snackbar>
        </FadeIn>
    )
}
