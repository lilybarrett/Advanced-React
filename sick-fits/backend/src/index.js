const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

// TODO use express middleware to handle cookies (JWT)
server.express.use(cookieParser());
// TODO use express middleware to populate current user
// decode the JWT token so we can get the user ID on each request
server.express.use((req, res, next) => {
  // all of this will happen between the request and response thanks to next
  const { token } = req.cookies;
  console.log(token);
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // put the userid onto the req for future requests to access
    // the verify with the app secret will make sure no one has monkeyed with the token
    req.userId = userId;
  }
  console.log("Heyyyy I'm a middleware");
  // next is the function that evokes the middleware
  next();
})

server.start(
    {
      cors: {
        credentials: true,
        origin: process.env.FRONTEND_URL,
      },
    },
    deets => {
      console.log(`Server is now running on port http://localhost:${deets.port}`);
    }
  );
