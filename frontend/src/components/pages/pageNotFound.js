

const pageNotFound = () => {
    return (
        <div style={{display:'flex', margin:'20%', flexDirection:'column', alignItems:'center'}}>
            <h1>Oops, page not found</h1>
            <a className="button" href="/">Return to Home Page</a>
        </div>
    )
}

export default pageNotFound
