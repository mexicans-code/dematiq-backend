const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

const getSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') {
      return errorResponse(res, error.message, 500);
    }

    successResponse(res, { key, value: data?.value || '' });
  } catch (err) {
    next(err);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return errorResponse(res, 'El campo "value" es requerido', 400);
    }

    const { data, error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .select()
      .single();

    if (error) {
      return errorResponse(res, error.message, 500);
    }

    successResponse(res, { key: data.key, value: data.value });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSetting, updateSetting };
