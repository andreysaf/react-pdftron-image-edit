import React, { useEffect, useRef } from 'react';
import WebViewer from '@pdftron/webviewer';

const PDFTronWebViewer = ({getInstance}) => {
    const viewer = useRef(null);

    useEffect(() => {
        WebViewer({
            path: '/webviewer', // point to where the files you copied are served from
            initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/PDFTRON_about.pdf', // path to your document
            fullAPI: true,
          }, viewer.current).then((instance) => {
            // Call APIs here
            getInstance(instance);
            instance.setTheme({
                primary: '#1e1e1e',
                secondary: '#1e1e1e',
                border: '#555555',
                buttonHover: '#000',
                buttonActive: '#000',
                text: '#FFFFFF',
                icon: '#FFFFFF',
            });
          })
    }, []);

    return (<div id='pdftron-webviewer' ref={viewer}></div>);
};

export default PDFTronWebViewer;