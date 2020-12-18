import React, { useState, useEffect } from 'react';
import axios from 'axios'

const baseAPI = `http://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}&s=`

function Card(props, recall, type) {
    return (
        <div className="card">
            <h3>{props.Title}</h3>
            <p>{props.Year}</p>
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

    const nominate = (data) => {
        setNominatedList(nominatedList.concat([data]))
        console.log(nominatedList)
    }

    const removeNominate = (imdbID) => {
        setNominatedList(nominatedList.filter(x => !(x.imdbID === imdbID)))
        console.log(nominatedList)
    }

    const apiCall = (query) => {
        axios.get(baseAPI + query)
            .then((res) => {
                setQueryData(res.data.Search)
            }).catch((err) => console.error(err))
    }

    const queryFormat = (query) => {
        return query.split(" ").join("+");
    }

    const submitHandler = (e) => {
        e.preventDefault();
        apiCall(queryFormat(userQuery))
    }

    const onChangeHandler = (e) => {
        setUserQuery(e.target.value);
    }

    useEffect(() => {
    }, [])

    return (
        <div>
            <form onSubmit={submitHandler}>
                <label for="fname">Search</label>
                <input type="text" id="fname" name="fname" onChange={onChangeHandler} />
                <input type="submit" value="Submit" />
            </form>
            <div>
                {data ? data.map(x => Card(x, nominate, "nominate")) : null}
            </div>

            <div>
                {nominatedList.length > 0 ? nominatedList.map(x => Card(x, removeNominate, "remove")) : "No data found"}
            </div>
        </div>
    )
}
