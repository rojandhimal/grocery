const { sequelize } = require("../models");
const { Op } = require("sequelize");

const filterMap = {
  price: sequelize.literal("amount - discount"),
};

const operatorValueMap = ({ operator, value }) => {
  switch (operator) {
    case Op.like:
      return `%${value}%`;
    case Op.notIn:
      return Array.isArray(value)
        ? value?.map((item) => (item?.value ? item?.value : item))
        : value.split(",");
    default:
      return value;
  }
};

const createFilter = ({ field, model, operator, value }) => {
  const scope = model?.virtualAttributeScope[field] || filterMap[field] || null;
  if (scope) {
    const val = operatorValueMap({ operator, value });
    return sequelize.where(scope, operator, val);
  }

  switch (operator) {
    case Op.like:
      return { [operator]: `%${value}%` };
    case Op.iLike:
      const args =
        field?.split(".")?.length > 1
          ? sequelize.json(field)
          : sequelize.col(field);
      return sequelize.where(
        sequelize.fn("LOWER", args),
        "LIKE",
        `%${value.toLowerCase()}%`
      );
    case Op.in:
    case Op.notIn:
      /**
       * except undefined value, all other values are getting added in [op.in] and [op.notIn] query
       * however query was producing right result, if found any other issue safe to remove
       **/
      return {
        [operator]: Array.isArray(value)
          ? value?.map((item) =>
              item?.value !== undefined ? item?.value : item
            )
          : typeof value === "string"
          ? value.split(",")
          : value,
      };
    case Op.gte:
      return { [operator]: value?.from ? value?.from : value };
    case Op.lte:
      return { [operator]: value?.to ? value?.to : value };

    default:
      return { [operator]: value };
  }
};

module.exports.createAndFilters = ({ filters = [], model, values }) => {
  let where = [];

  const createFilterObj = (filter, where) => {
    const { alias, field, operator, value: filterValue } = filter || {};
    const key = alias || field;
    const val = values && values?.[key];
    const value =
      typeof val === "object" && val !== null && !Array.isArray(val)
        ? val?.value
        : val !== undefined && val !== null
        ? val
        : filterValue;
    // replaced 'val || filterValue' by '(val !== undefined && val !== null) ? val : filterValue' to support 0 as valid value for val variable
    // filterValue checks if the value `null` is passed in the filter itself to support Op.ne: null checks
    if (
      value ||
      value === null ||
      filterValue === null ||
      value === 0 ||
      filterValue === 0 ||
      typeof value === "boolean"
    ) {
      const filterObj = createFilter({ field, model, operator, value });
      if (filterObj?.attribute) {
        where.push(filterObj);
      } else where.push({ [field]: filterObj });
    }
  };

  filters.map((filter) => {
    if (Array.isArray(filter) && filter.length > 0) {
      let orWhere = [];
      filter.map((subFilter) => {
        createFilterObj(subFilter, orWhere);
      });
      orWhere.length > 0 && where.push({ [Op.or]: orWhere });
    } else {
      createFilterObj(filter, where);
    }
  });
  return { [Op.and]: where };
};
