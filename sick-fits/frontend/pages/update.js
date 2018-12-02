import UpdateItem from "../components/UpdateItem";

const Update = ({ query }) => (
    <div>
        <UpdateItem id={query.id} />
        {/* we have access to this query ID because we're exposing the pageProps to every page we have via our context/NextJS getInitialProps */}
    </div>
);

export default Update;