import React, { useState } from 'react';
import WebViewer from './PDFTronWebViewer';
import ImageEditor from './ImageEditor';
import FileSaver, { saveAs } from 'file-saver';
import Header from './Header';
import './styles.css';

const App = () => {
  const [webviewerInstance, setWebViewerInstance] = useState(null);
  const [imageEditorInstance, setImageEditorInstance] = useState(null);
  const [pageEdit, setPageEdit] = useState(0);

  const getViewerInstance = (instance) => {
    setWebViewerInstance(instance);
  };

  const getImageEditorInstance = (instance) => {
    setImageEditorInstance(instance);
  };

  const editImage = async () => {
    const { docViewer, PDFNet } = webviewerInstance;
    await PDFNet.initialize();
    const doc = await docViewer.getDocument().getPDFDoc();
    doc.initSecurityHandler();
    doc.lock();
    const pdfdraw = await PDFNet.PDFDraw.create(92);
    setPageEdit(docViewer.getCurrentPage());
    const itr = await doc.getPageIterator(docViewer.getCurrentPage());
    const currPage = await itr.current();
    const pngBuffer = await pdfdraw.exportStream(currPage, 'PNG');
    let blob = new Blob([pngBuffer], {
      type: 'image/png',
    });
    imageEditorInstance.loadImageFromFile(blob, 'image.png');
  };

  const saveImage = async () => {
    const { docViewer, CoreControls } = webviewerInstance;

    let image = await imageEditorInstance.toDataURL();
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const binary_string = window.atob(base64Data);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });

    const doc = docViewer.getDocument();

    const secondDoc = await CoreControls.createDocument(blob, {
      extension: 'png',
    });
    const pagesToInsert = [1];
    const pageIndexToInsert = pageEdit;

    doc.insertPages(secondDoc, pagesToInsert, pageIndexToInsert).then(async () => {
      await doc.removePages([pageEdit+1]);
    });
  };

  return (
    <div className="container">
      <WebViewer getInstance={getViewerInstance} />
      <ImageEditor getInstance={getImageEditorInstance} />
      <Header editImage={editImage} saveImage={saveImage} />
    </div>
  );
};

export default App;
