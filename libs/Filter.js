module.exports = class Filter {
  static eq(field, value) {
    return field + "=" + value;
  }

  static ne(field, value) {
    return field + "!=" + value;
  }

  static gt(field, value) {
    return field + ">" + value;
  }

  static gte(field, value) {
    return field + ">=" + value;
  }

  static lt(field, value) {
    return field + "<" + value;
  }

  static lte(field, value) {
    return field + "<=" + value;
  }

  static text(field, value) {
    return field + "=~" + value;
  }

  static regex(field, regex) { return field + "~~" + regex; }
  
  static not(value) { return "!(" + value + ")"; }

  static in(field, ...values) {
    if(Array.isArray(values[0])) {
      return field + "==[" + values[0] + "]";
    }
    return field + "==[" + values + "]";
  }

  static and(...filters) {
    for(let i = 0; i < filters.length; i++) {
      if(filters[i].includes("&&") || filters[i].includes("||")) {
        filters[i] = "(" + filters[i] + ")";
      }
    }
    return filters.join("&&");
  }

  static or(...filters) {
    for (let i = 0; i < filters.length; i++) {
      if (filters[i].includes("&&") || filters[i].includes("||")) {
        filters[i] = "(" + filters[i] + ")";
      }
    }
    return filters.join("||");
  }
}