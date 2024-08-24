export const HTTPResponse = (status, data = {}, message = '') => {
    return { status, data, message };
};
