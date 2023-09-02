import React, { useEffect, useRef, useState } from 'react'
import logo from "./aaailogo.png"
import { ToastContainer, toast, Zoom, Flip } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Papa, { unparse } from 'papaparse'
import { useCSVDownloader } from 'react-papaparse';

export default function App() {
  const { CSVDownloader, Type } = useCSVDownloader();
  const [loopStart, setLoopStart] = useState([]);
  const [file, setFile] = useState([]);
  const [fileData, setFileData] = useState([]);
  const selectRgbRef = useRef(null);
  const selectIrRef = useRef(null);
  const selectControlRef = useRef(null);
  const selectFolderRef = useRef(null);
  // var count1 = 0;
  // var count2 = 0;
  // var count3 = 0;
  // var count4 = 0;
  // var count5 = 0;
  // var count6 = 0;
  // var count7 = 0;

  const handleFolderSelect = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const directoryInput = document.createElement("input");
    directoryInput.setAttribute("type", "file");
    directoryInput.setAttribute("webkitdirectory", true);
    directoryInput.setAttribute("directory", true);
    directoryInput.setAttribute("multiple", true);
    directoryInput.click();
    directoryInput.addEventListener("change", handleFileSelect, false);
  }

  const handleFileSelect = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.target.files;

    if (files.length === 0) {
      alert("No files found");
      return;
    }

    setFile([]);
    const jsonFiles = Array.from(files).filter(
      (file) => file.type === "application/json"
    );

    if (jsonFiles.length > 0) {
      const updatedFileData = [...fileData];
      for (let i = 0; i < jsonFiles.length; i++) {
        const jsonReader = new FileReader();
        jsonReader.onload = (e) => {
          const json = JSON.parse(e.target.result);
          updatedFileData.push(json);
          setFileData(updatedFileData);
        };
        jsonReader.readAsText(jsonFiles[i]);
      }
    }
    toast.info('Your data is ready to download!', {
      position: "top-center",
      transition: Flip,
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    // csvDownloadUniversal();
  }

  const convertToCSV = (data) => {
    const headers = ['FileName', 'Trackid', 'category', 'Hierarchy', 'xDiff', 'yDiff', 'is_small_objects'];
    const csvRows = [];

    // Create CSV header row
    csvRows.push(headers.join(','));

    // Create CSV data rows
    data.forEach((item) => {
      const values = headers.map((header) => item[header]);
      // const values = item[0];
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  const convertToCSVUniversal = (data) => {
    const headers = ['FileName', 'Control_Ego', 'Control_Ego_Trackid', 'Position', 'Position_Trackid', 'Attributes', 'Attributes_Trackid', 'Ambiguity_Flag_SC', 'Ambiguity_Flag_SC_Trackid', 'Ambiguity_Flag_In', 'Ambiguity_Flag_In_Trackid', 'Terrain_Drivable', 'Terrain_Drivable_Trackid', 'Traffic_Light_Car_Direction', 'Traffic_Light_Car_Direction_Trackid'];
    const csvRows = [];

    // Create CSV header row
    csvRows.push(headers.join(','));

    // Create CSV data rows
    // data.forEach((item) => {
    //   const values = headers.map((header) => item[header]);
    //   // const values = item[0];
    //   // csvRows.push(values.join(','));
    //   if (values.every((value) => value !== null && value !== undefined)) {
    //     csvRows.push(values.join(','));
    //   }

    //   // && value !== ''
    // });
    // data.forEach((item) => {
    //   const values = headers.map((header) => {
    //     // Handle the special case for columns with arrays
    //     if (header.endsWith('_Trackid')) {
    //       // Check if the value is an array and join its elements with commas
    //       if (Array.isArray(item[header])) {
    //         return item[header].join(',');
    //       }
    //     }
    //     return item[header];
    //   });

    //   if (values.every((value) => value !== null && value !== undefined)) {
    //     csvRows.push(values.join(','));
    //   }
    // });


    // return csvRows.join('\n');

    data.forEach((item) => {
      const values = headers.map((header) => {
        // Handle the special case for columns with arrays
        if (header.endsWith('_Trackid')) {
          // Check if the value is an array and join its elements with commas
          if (Array.isArray(item[header])) {
            return item[header].join(', '); // Notice the space after the comma
          }
        }
        return item[header];
      });

      if (values.every((value) => value !== null && value !== undefined)) {
        csvRows.push(values.join(','));
      }
    });

    return csvRows.join('\n');
  }

  const csvDownloadIR = () => {
    const arr = [];
    for (let i = 0; i < fileData.length; i++) {
      const file = fileData[i].Sequence[0].SequenceDetails.FileName;
      const start = fileData[i].Sequence[0].Labels[0].Devices[0].Channels[0].ObjectLabels[0].FrameObjectLabels;
      for (let j = 0; j < start.length; j++) {
        const target = { FileName: null, Trackid: null, category: null, Hierarchy: null, xDiff: null, yDiff: null, is_small_objects: null };
        target.FileName = file;
        target.Trackid = start[j].Trackid;
        target.category = start[j].category;
        target.Hierarchy = start[j].attributes.Hierarchy[0];
        const xMin = Math.min(...start[j].shape.x);
        const xMax = Math.max(...start[j].shape.x);
        const yMin = Math.min(...start[j].shape.y);
        const yMax = Math.max(...start[j].shape.y);
        target.xDiff = xMax - xMin;
        target.yDiff = yMax - yMin;
        if (target.xDiff < 4 && target.yDiff < 4) {
          target.is_small_objects = 'Yes';
        } else {
          target.is_small_objects = 'No';
        }
        arr.push(target);
      }
    }
    setLoopStart(arr);
    toast.success('Downloading', {
      position: "top-center",
      transition: Zoom,
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

    const csv = convertToCSV(arr);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'IR.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const csvDownloadUniversal = () => {
    const arr = [];
    for (let i = 0; i < fileData.length; i++) {
      const cearr = [];
      const parr = [];
      const attrarr = [];
      const scafarr = [];
      const inafarr = [];
      const tedrarr = [];
      const tlcdarr = [];

      let count1 = 0;
      let count2 = 0;
      let count3 = 0;
      let count4 = 0;
      let count5 = 0;
      let count6 = 0;
      let count7 = 0;

      const file = fileData[i].Sequence[0].SequenceDetails.FileName;
      const start = fileData[i].Sequence[0].Labels[0].Devices[0].Channels[0].ObjectLabels[0].FrameObjectLabels;
      const target = { FileName: "No_Errors_In_File", Control_Ego: "Condition_OK", Control_Ego_Trackid: "None", Position: "Condition_OK", Position_Trackid: "None", Attributes: "Condition_OK", Attributes_Trackid: "None", Ambiguity_Flag_SC: "Condition_OK", Ambiguity_Flag_SC_Trackid: "None", Ambiguity_Flag_In: "Condition_OK", Ambiguity_Flag_In_Trackid: "None", Terrain_Drivable: "Condition_OK", Terrain_Drivable_Trackid: "None", Traffic_Light_Car_Direction: "Condition_OK", Traffic_Light_Car_Direction_Trackid: "None" };
      for (let j = 0; j < start.length; j++) {

        // if (start[j].attributes && start[j].attributes["Control Ego "]) {

        if (start[j].attributes["Control Ego "]) {
          if (start[j].attributes["Control Ego "][0] === "Yes") {
            count1 = count1 + 1;
            // console.log("ControlEgo", file, "Yes");
            cearr.push(start[j].Trackid);
          }
        }
        if (start[j].attributes["Position"]) {
          if (start[j].attributes["Position"][0] === "Leading") {
            count2 += 1;
            parr.push(start[j].Trackid);
          }
        }
        if (Object.keys(start[j].attributes).length !== 0) {
          // for (let k = 0; k < Object.keys(start[j].attributes).length; k++) {
          //   if(Object.keys(start[]))
          // }

          for (const key in start[j].attributes) {
            if (start[j].attributes.hasOwnProperty(key)) {
              if (start[j].attributes[key].length !== 0) {
                if (start[j].attributes[key][0] === "" || start[j].attributes[key][0] === " ") {
                  count3 = 1;
                  attrarr.push(start[j].Trackid);
                }
                // break the loop here if you only want to know if there's at least one empty array.
                // break;
              }
            }
          }
        }
        if (start[j].category === "Specific Car") {
          if (start[j].attributes["Ambiguity flag"][0] === "No") {
            count4 = 1;
            scafarr.push(start[j].Trackid);
          }
        }
        if (start[j].category === "Invisible") {
          if (start[j].attributes["Ambiguity flag"][0] === "No") {
            count5 = 1;
            console.log(file, "InNo");
            inafarr.push(start[j].Trackid);
          }
        }
        if (start[j].category === "Terrain") {
          if (start[j].attributes["Drivable"]) {
            if (start[j].attributes["Drivable"][0] === "Yes") {
              count6 = 1;
              tedrarr.push(start[j].Trackid);
            }
          }
        }
        if (start[j].category === "Traffic Light Car") {
          if (start[j].attributes["direction"]) {
            if (start[j].attributes["direction"][0] === "Other") {
              count7 = 1;
              tlcdarr.push(start[j].Trackid);
            }
          }
        }
      }
      // console.log("CE", file, count1);
      if (count1 > 2 || count1 < 2) {
        target.FileName = file;
        target.Control_Ego = "Error";
        target.Control_Ego_Trackid = [...cearr].toString();
        count1 = 0;
      }
      if (count2 === 0) {
        target.FileName = file;
        target.Position = "No_Leading";
        target.Position_Trackid = [...parr].toString();
        count2 = 0;
      } else if (count2 > 1) {
        target.FileName = file;
        target.Position = "More_than_1_leading";
        target.Position_Trackid = [...parr].toString();
        count2 = 0;
      }
      if (count3 === 1) {
        target.FileName = file;
        target.Attributes = "Error";
        target.Attributes_Trackid = [...attrarr].toString();
        count3 = 0;
      }
      if (count4 === 1) {
        target.FileName = file;
        target.Ambiguity_Flag_SC = "Check_Once";
        target.Ambiguity_Flag_SC_Trackid = [...scafarr].toString();
        count4 = 0;
      }
      if (count5 === 1) {
        target.FileName = file;
        target.Ambiguity_Flag_In = "Check_Once";
        target.Ambiguity_Flag_In_Trackid = [...inafarr].toString();
        count5 = 0;
      }
      if (count6 === 1) {
        target.FileName = file;
        target.Terrain_Drivable = "Check_Once";
        target.Terrain_Drivable_Trackid = [...tedrarr].toString();
        count6 = 0;
      }
      if (count7 === 1) {
        target.FileName = file;
        target.Traffic_Light_Car_Direction = "Error";
        target.Traffic_Light_Car_Direction_Trackid = [...tlcdarr].toString();
        count7 = 0;
      }
      arr.push(target);
    }
    setLoopStart(arr);
    // toast.success('Downloading', {
    //   position: "top-center",
    //   transition: Zoom,
    //   autoClose: 1500,
    //   hideProgressBar: false,
    //   closeOnClick: true,
    //   pauseOnHover: true,
    //   draggable: true,
    //   progress: undefined,
    //   theme: "light",
    // });


    // const csv = convertToCSVUniversal(arr);
    // const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'Universal.csv';
    // a.click();
    // URL.revokeObjectURL(url);

    // const json = JSON.stringify(getobj(arr));
    // const blob = new Blob([json], { type: 'text/json;charset=utf-8' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'Universal.json';
    // a.click();
    // URL.revokeObjectURL(url);

    const csvData = arr.map(obj => ({
      ...obj,
      "Control_Ego_Trackid": `"${obj["Control_Ego_Trackid"]}"`,
      "Position_Trackid": `"${obj["Position_Trackid"]}"`,
      "Attributes_Trackid": `"${obj["Attributes_Trackid"]}"`,
      "Ambiguity_Flag_SC_Trackid": `"${obj["Ambiguity_Flag_SC_Trackid"]}"`,
      "Ambiguity_Flag_In_Trackid": `"${obj["Ambiguity_Flag_In_Trackid"]}"`,
      "Terrain_Drivable_Trackid": `"${obj["Terrain_Drivable_Trackid"]}"`,
      "Traffic_Light_Car_Direction_Trackid": `"${obj["Traffic_Light_Car_Direction_Trackid"]}"`
    }));
    const arrofobjtocsv = Papa.unparse(csvData);
    // console.log("CSV", arrofobjtocsv);

    // const csv = convertToCSVUniversal(arr);

    const blob = new Blob([arrofobjtocsv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Universal.csv';
    a.click();
    URL.revokeObjectURL(url);

    // const json = JSON.stringify(getobj(csvData));
    // const blob = new Blob([json], { type: 'text/json;charset=utf-8' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'Universal.json';
    // a.click();
    // URL.revokeObjectURL(url);
  }

  // const getobj = (arr) => {
  //   const obj1 = {
  //     Data: [...arr]
  //   }
  //   return obj1;
  // }

  // const csvDownloadControlEgo = () => {
  //   const arr = [];
  //   for (let i = 0; i < fileData.length; i++) {
  //     const file = fileData[i].Sequence[0].SequenceDetails.FileName;
  //     const start = fileData[i].Sequence[0].Labels[0].Devices[0].Channels[0].ObjectLabels[0].FrameObjectLabels;
  //     for (let j = 0; j < start.length; j++) {
  //       const target = { FileName: null, Trackid: null, category: null, Hierarchy: null, Control_Ego: null };

  //       if (start[j].attributes && start[j].attributes["Control Ego "]) {
  //         target.FileName = file;
  //         target.Trackid = start[j].Trackid;
  //         target.category = start[j].category;
  //         target.Hierarchy = start[j].attributes.Hierarchy[0];
  //         target.Control_Ego = start[j].attributes["Control Ego "][0];
  //       }
  //       arr.push(target);
  //     }
  //   }
  //   setLoopStart(arr);
  //   toast.success('Downloading', {
  //     position: "top-center",
  //     transition: Zoom,
  //     autoClose: 1500,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //     theme: "light",
  //   });


  //   const csv = convertToCSVControlEgo(arr);
  //   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'Control_Ego.csv';
  //   a.click();
  //   URL.revokeObjectURL(url);
  // }

  const csvDownloadRGB = () => {
    // const list = [...res].map((item) =>
    //   [item.image_url, item.tagged_class]
    // );
    // const jsonFile = list.map((subarray) => (
    //   {
    //     "image_url": subarray[0],
    //     "jeans_fit_type": subarray[1],
    //   })
    // );

    const arr = [];
    for (let i = 0; i < fileData.length; i++) {
      const file = fileData[i].Sequence[0].SequenceDetails.FileName;
      const start = fileData[i].Sequence[0].Labels[0].Devices[0].Channels[0].ObjectLabels[0].FrameObjectLabels;
      for (let j = 0; j < start.length; j++) {
        const target = { FileName: null, Trackid: null, category: null, Hierarchy: null, xDiff: null, yDiff: null, is_small_objects: null };
        target.FileName = file;
        target.Trackid = start[j].Trackid;
        target.category = start[j].category;
        target.Hierarchy = start[j].attributes.Hierarchy[0];
        const xMin = Math.min(...start[j].shape.x);
        const xMax = Math.max(...start[j].shape.x);
        const yMin = Math.min(...start[j].shape.y);
        const yMax = Math.max(...start[j].shape.y);
        target.xDiff = xMax - xMin;
        target.yDiff = yMax - yMin;
        if (target.xDiff < 6 && target.yDiff < 6) {
          target.is_small_objects = 'Yes';
        } else if ((target.xDiff >= 6 && target.xDiff <= 8) && (target.yDiff >= 6 && target.yDiff <= 8)) {
          target.is_small_objects = 'Check';
        } else {
          target.is_small_objects = 'No';
        }
        arr.push(target);
      }
    }
    setLoopStart(arr);
    toast.success('Downloading', {
      position: "top-center",
      transition: Zoom,
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });


    const csv = convertToCSV(arr);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RGB.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // const renderBranches = () => {
  //   const sel = selectFolderRef.current.getBoundingClientRect();
  //   const selx1 = sel.left + (sel.width / 2);
  //   const sely1 = sel.top + sel.height;

  //   const rgb = selectRgbRef.current.getBoundingClientRect();
  //   const rgbx = rgb.left + (rgb.width / 2);
  //   const rgby = rgb.top;

  //   return (
  //     <g>
  //       <line x1={selx1} y1={sely1} x2={rgbx} y2={rgby} />
  //       {/* <line x1="50%" y1="50%" x2="25%" y2="75%" />
  //       <line x1="50%" y1="50%" x2="75%" y2="75%" /> */}
  //     </g>
  //   );
  // }

  // const renderBranches = () => {
  //   if (selectFolderRef.current && selectRgbRef.current) {
  //     const selRect = selectFolderRef.current.getBoundingClientRect();
  //     const rgbRect = selectRgbRef.current.getBoundingClientRect();
  //     const irRect = selectIrRef.current.getBoundingClientRect();
  //     const controlRect = selectControlRef.current.getBoundingClientRect();

  //     const selx1 = selRect.left + selRect.width / 2;
  //     const sely1 = selRect.top + selRect.height;
  //     const rgbx = rgbRect.left + rgbRect.width / 2;
  //     const rgby = rgbRect.top;
  //     const irx = irRect.left + irRect.width / 2;
  //     const iry = irRect.top;
  //     const controlx = controlRect.left + controlRect.width / 2;
  //     const controly = controlRect.top;

  //     return (
  //       <svg className="connecting-lines">
  //         <line x1={selx1} y1={sely1} x2={rgbx} y2={rgby} stroke="white" strokeWidth="2" />
  //         <line x1={selx1} y1={sely1} x2={irx} y2={iry} stroke="white" strokeWidth="2" />
  //         <line x1={selx1} y1={sely1} x2={controlx} y2={controly} stroke="white" strokeWidth="2" />
  //       </svg>
  //     );
  //   }
  //   return null;
  // };

  return (
    <div className="bg-gradient-to-r from-slate-600 via-slate-800 to-slate-950 h-screen w-full ">
      <div className="h-1/7 flex  justify-between">
        <img className="h-20" src={logo} />
        <p class="flex items-center font-semibold text-2xl justify-center mr-8">
          <span class="bg-gradient-to-r text-transparent bg-clip-text from-cyan-100 to-blue-300">JSON QUALITY CHECK</span>
        </p>
      </div>
      <div className="bg-gradient-to-r from-slate-600 via-slate-800 to-slate-950 h-1/2  w-full flex justify-center items-center">
        {/* <svg className='border-none mt-16' xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}> */}
        {/* <foreignObject width="100%" height="100%"> */}
        <div className='text-center flex flex-col gap-32  justify-center items-center' style={{ width: '100%', height: '100%' }}>
          <button className="bg-orange-400 text-white rounded px-4 py-2 shadow-lg shadow-black font-medium w-max" onClick={handleFolderSelect} ref={selectFolderRef} disabled={fileData.length > 0}>{fileData.length > 0 ? 'Ready to Download' : 'Select Json Folder'}</button>
          <div className='flex gap-20'>
            <button className="bg-gray-600 text-white rounded px-4 py-2 shadow-lg shadow-black font-medium" onClick={() => csvDownloadRGB()} ref={selectRgbRef} disabled={fileData.length === 0}>Download CSV RGB{fileData.length > 0 && <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-100" style={{ background: 'red' }}></span>}</button>
            <button className="bg-gray-600 text-white rounded px-4 py-2 shadow-lg shadow-black font-medium" onClick={() => csvDownloadIR()} ref={selectIrRef} disabled={fileData.length === 0}>Download CSV IR{fileData.length > 0 && <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-100" style={{ background: 'lightgreen' }}></span>}</button>
            {/* <button className="bg-gray-600 text-white rounded px-4 py-2 shadow-lg shadow-black font-medium" onClick={() => csvDownloadControlEgo()} ref={selectControlRef} disabled={fileData.length === 0}>Download CSV Control Ego{fileData.length > 0 && <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-100" style={{ background: 'skyblue' }}></span>}</button> */}
            <button className="bg-gray-600 text-white rounded px-4 py-2 shadow-lg shadow-black font-medium" onClick={() => csvDownloadUniversal()} ref={selectControlRef} disabled={fileData.length === 0}>Download Universal{fileData.length > 0 && <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-100" style={{ background: 'skyblue' }}></span>}</button>
            {/* <CSVDownloader
              type={Type.Button}
              filename={'universal'}
              bom={true}
              config={{
                delimiter: ';',
              }}
              data={() => csvDownloadUniversal()}
            >
              Download Universal
            </CSVDownloader> */}
          </div>
        </div>
        {/* </foreignObject> */}
        {/* {renderBranches()} */}
        {/* </svg> */}
      </div>
      <ToastContainer />
    </div>
  );
}