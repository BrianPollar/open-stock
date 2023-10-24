/** */
export const stringifyMongooseErr = (errors: object): string => {
  const errorsStrArr = Object.keys(errors).map(key => {
    let err = '';
    if (errors[key].kind === 'unique') {
      err = errors[key].message;
    } else {
      err = key + ' ' + errors[key].message;
    }
    return err;
  });
  return errorsStrArr.join(', ');
};
