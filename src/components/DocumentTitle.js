/**
 * Created by bwallace on 4/27/2016.
 */
import React, { PropTypes } from 'react';
import ReactDocumentTitle from 'react-document-title';

function DocumentTitle ({title, children}) {
    const fullTitle = `${__APPTITLE__} - ${title}`;
    return <ReactDocumentTitle title={fullTitle} children={children} />;
}

DocumentTitle.propTypes = {
    title: PropTypes.string.isRequired,
};

export default DocumentTitle;
