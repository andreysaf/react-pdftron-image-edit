import React, { useState } from "react";
import WebViewer from "./PDFTronWebViewer";
import ImageEditor from "./ImageEditor";
import FileSaver, { saveAs } from 'file-saver';
import Header from "./Header";
import "./styles.css";

const App = () => {
  const [webviewerInstance, setWebViewerInstance] = useState(null);
  const [imageEditorInstance, setImageEditorInstance] = useState(null);
  const [pageEdit, setPageEdit] = useState(0);

  const getViewerInstance = instance => {
    setWebViewerInstance(instance);
  };

  const getImageEditorInstance = instance => {
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
    const pngBuffer = await pdfdraw.exportStream(currPage, "PNG");
    let blob = new Blob([pngBuffer], {
        type: 'image/png',
      });
    imageEditorInstance.loadImageFromFile(blob, "image.png");
  };

  const saveImage = async () => {
    const { docViewer, PDFNet } = webviewerInstance;
    
    let image = await imageEditorInstance.toDataURL();
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    var binary_string = window.atob(base64Data);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }

    await PDFNet.initialize();
    const doc = await docViewer.getDocument().getPDFDoc();
    doc.initSecurityHandler();
    doc.lock();
    const itr = await doc.getPageIterator(pageEdit);
    const page = await itr.current();
    const writer = await PDFNet.ElementWriter.create();
    const builder = await PDFNet.ElementBuilder.create();
    writer.beginOnPage(page, PDFNet.ElementWriter.WriteMode.e_overlay);

    const img = await PDFNet.Image.createFromMemory2(doc, bytes);
    const matrix = await PDFNet.Matrix2D.create(docViewer.getPageWidth(pageEdit), 0, 0, docViewer.getPageHeight(pageEdit), 0, 0);
    const element = await builder.createImageFromMatrix(img, matrix);
    writer.writePlacedElement(element);
    writer.end();

    docViewer.refreshAll();
    docViewer.updateView();
    docViewer.getDocument().refreshTextData();
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
