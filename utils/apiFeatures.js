class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    const queryStringObj = { ...this.queryString };
    const excludeFields = ["page", "limit", "sort", "fields"];
    excludeFields.forEach((field) => delete queryStringObj[field]);
    console.log(queryStringObj);
    let querystr = JSON.stringify(queryStringObj);
    querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(querystr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort.split(",").join(" ");
      console.log(sortBy);
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    }

    return this;
  }

  limit() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(",").join(" ");
      console.log(fields);
      this.mongooseQuery = this.mongooseQuery.select(fields);
    }
    return this;
  }

  search() {
    if (this.queryString.keyword) {
      console.log(this.queryString.keyword);
      const query = {
        $or: [
          {
            title: {
              $regex: this.queryString.keyword,
              $options: "i",
            },
          },
          { description: { $regex: this.queryString.keyword, $options: "i" } },
        ],
      };

      console.log(query);

      this.mongooseQuery = this.mongooseQuery.find(query);
    }

    return this;
  }

  paginate(docsNumber) {
    const page = this.queryString.page || 1;
    const limit = this.queryString.limit || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.pagesNumber = Math.ceil(docsNumber / limit);

    if (endIndex < docsNumber) {
      pagination.next = parseInt(page) + 1;
    }

    if (skip > 0) {
      pagination.prev = parseInt(page) - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResults = pagination;

    return this;
  }
}

module.exports = ApiFeatures;
