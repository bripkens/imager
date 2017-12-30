import { createStore } from "@bripkens/rxstore";
import { compose } from "recompose";
import radium from "radium";
import React from "react";

import { location$, setQueryString } from "../../stores/location";
import connect from "../../hoc/connect";

const store = createStore({
  name: "TopBar/Query",

  getInitialState() {
    return "";
  },

  actions: {
    set(oldQuery, newQuery) {
      return newQuery;
    }
  }
});

// url to input synchronization
location$.subscribe(location => store.actions.set(location.query.q || ""));

// debounced input to url synchronization
store.observable
  .debounceTime(100)
  .subscribe(query => setQueryString("q", query));

const styles = {
  base: {
    padding: "0.1rem 0.45rem",
    fontSize: "0.9rem",
    lineHeight: "1.3",
    color: "#fff",
    backgroundColor: "#434857",
    border: "1px solid #434857",
    borderRadius: "0.25rem",
    width: "100%",

    ":focus": {
      color: "#495057",
      backgroundColor: "#fff",
      border: "1px solid #71cced",
      outline: "none"
    }
  }
};

export default compose(connect({ query: store.observable }), radium)(Query);

function Query({ query }) {
  return (
    <input
      type="text"
      style={styles.base}
      placeholder="Search…"
      value={query}
      onChange={onChange}
    />
  );
}

function onChange(e) {
  store.actions.set(e.target.value);
}