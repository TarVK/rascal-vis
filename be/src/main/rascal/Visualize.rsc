module Visualize

import util::Webserver;

loc visLoc = |http://localhost:10001|;

@doc {
    Sends the given value to the visualization website
}
void visualize(value val) {
   Response testServer(get("/data")) = response("<val>", header = ("Access-Control-Allow-Origin": "*"));
   
   try {
      stopVisualize();
      serve(visLoc, testServer);
      return;
   }
   catch value exception:
     throw exception;
}

@doc {
    Stops the server used for visualizing the last sent data
}
bool stopVisualize() {
    try {
        shutdown(visLoc);
        return true;
    } catch value exception:
         throw exception;
    finally {
        return false;
    }
}