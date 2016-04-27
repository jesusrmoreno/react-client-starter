/**
 * Created by bwallace on 4/27/2016.
 */
/*
 Defines the content security policy for the app
 */

export default (config) => {
    const csp = {
        'default-src': ["'none'"],
        'script-src': ["'self'"],
        'style-src': [
            "'self'",
            'blob:',
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://maxcdn.bootstrapcdn.com",
        ],
        'font-src': [
            "'self'",
            'https://fonts.gstatic.com',
            "https://maxcdn.bootstrapcdn.com",
        ],
        'connect-src': ["'self'"],
        'img-src': ["'self'", "data:"],
    };

    return Object.keys(csp).map(key => `${key} ${csp[key].join(' ')}`).join(';');
};
