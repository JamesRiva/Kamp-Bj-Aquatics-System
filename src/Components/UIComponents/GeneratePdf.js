import React, { useState } from 'react';
import '../Styles/GeneratePdf.css';
import html2pdf from "html2pdf.js";
import html2canvas from 'html2canvas';
import ButtonComponent from './ButtonComponent';
import LoadingState from '../UIComponents/LoadingState';

const GeneratePdf = ({elementId, date, reportTitle, elementGraphsTable, elementsGraphsDescription, elementGraphWrapper, graphWrapperHeight, graphClass}) => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [graphImages, setGraphImages] = useState([]);

  const convertGraphsToImage = async () => {
    setLoading(true);

    const graphs = document.querySelectorAll(`.${elementId}`);
    const graphsTable = document.querySelectorAll(`.${elementGraphsTable}`);
    const graphsDescription = document.querySelectorAll(`.${elementsGraphsDescription}`);
    const graphsWrapper = document.querySelectorAll(`.${elementGraphWrapper}`);
    const customGraphClass = document.querySelector(`.${graphClass}`)

    if (graphs.length > 0) {
      const images = [];

      graphsTable.forEach(table => table.style.display = 'block');
      graphsDescription.forEach(description => description.style.display = 'flex');
      graphsWrapper.forEach(wrapper => wrapper.style.height = '280px');

      // Get the current computed styles of the element
      const computedStyles = window.getComputedStyle(customGraphClass);
      // Retrieve the current grid-column value
      const defaultGridColumn = computedStyles.getPropertyValue('grid-column');

      customGraphClass.style.gridColumn = '1 / 2';

      setTimeout( async() => {
        for (const graph of graphs) {
          const originalStyles = {
            width: graph.style.width,
          };
  
          try {
            
            const canvas = await html2canvas(graph, { scale: 3 });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            images.push(imgData);
          } catch (error) {
            console.error('Error capturing image:', error);
          } finally {
            graph.style.width = originalStyles.width;
          }
        }

        setGraphImages(images);
        setShowPreview(true);

        graphsTable.forEach(table => table.style.display = 'none');
        graphsDescription.forEach(description => description.style.display = 'none');
        graphsWrapper.forEach(wrapper => wrapper.style.height = `${graphWrapperHeight}`);
        customGraphClass.style.gridColumn = defaultGridColumn;

        setLoading(false); 
      }, 2000)
      
    } else {
      console.warn('No graph containers found.');
      setLoading(false); 
    }

  }

  return (
    <div className='generate-pdf'>
      <i className="generate-pdf__icon fa-solid fa-file-arrow-down" title='Generate Preview' onClick={convertGraphsToImage}></i>

      {
        showPreview && <Preview graphs={graphImages} date={date} closePreview={() => setShowPreview(false)} setShowPreview={setShowPreview} reportTitle={reportTitle}/>
      }

      {loading && <LoadingState />}
    </div>
  )
}

export default GeneratePdf



export const Preview = ({graphs, closePreview, date, setShowPreview, reportTitle}) => {
  const generatePdf = () => {
    let footer = document.querySelector(`.preview__footer`);
    const previewElement = document.getElementById('preview-body');
    const previewContainer = document.querySelector('.preview__graphs-container');
    const closeIcon = document.querySelector('.preview__close-icon');

    if (previewElement) {
      footer.style.display = 'none';  
      previewContainer.style.height = '500vh';
      closeIcon.style.display = 'none';
      previewElement.style.margin = '10px';

      // Configure html2pdf with custom options
      const options = {
        filename: `Inventory_Reports_${date}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { 
          unit: 'mm', 
          format: 'letter',
          orientation: 'portrait' 
        }
      };

      html2pdf()
        .from(previewElement)
        .set(options) // Apply the custom options
        .save();
      
    } else {
      console.error('Preview element not found!');
    }
    
    setTimeout(() => {
      footer.style.display = 'flex';
      previewContainer.style.height = '75vh';
      closeIcon.style.display = 'block';
      previewElement.style.margin = '';
    }, 500)

    setShowPreview(false);
  };

  return (
    <div className='preview'>
      <div className='preview__container'>
        <div className="preview__body" id='preview-body'>
          <div className='preview__title-wrapper'>
            <h3>{reportTitle} Preview </h3>
            <p>{date}</p>
            <i className="preview__close-icon fa-solid fa-xmark" title='Close Preview' onClick={closePreview}></i>
          </div>

          <div className='preview__graphs-container'>
            {
              graphs && graphs.length > 0 ? (
                graphs.map((imgSrc, index) => (
                  <div className='preview__graphs-wrapper' key={index}>
                    <img  
                      src={imgSrc}
                      alt={`Graph Preview ${index + 1}`}
                      className="preview__image"
                    />
                  </div>
                ))
              ) : (
                <p>No graphs to preview</p>
              )
            }
          </div>

          <div className='preview__footer'>
            <ButtonComponent label='Print' onClick={generatePdf} />
            <ButtonComponent label='Cancel' onClick={closePreview} />
          </div>
         
        </div>
      </div>
    </div>
  )
}