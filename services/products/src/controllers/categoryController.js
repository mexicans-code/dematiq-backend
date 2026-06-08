const supabase = require('../../../../common/src/supabase');
const { successResponse } = require('../../../../common/src/utils/response');

const getAll = async (req, res, next) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    successResponse(res, categories || []);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll };
