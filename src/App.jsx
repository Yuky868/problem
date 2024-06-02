// eslint-disable-next-line no-unused-vars
import { useState, useEffect, useRef } from "react";
import * as mammoth from "mammoth";
import { Space, Row, Col, Button, Card, Radio } from "antd";
import MyEditor from "./components/Editor";
import {getUuid, dataURLtoFile  } from './utils/index'
import "./App.css";
import Uploader from './components/Upload.jsx'
import { getLines, splitproblem } from './utils/test.js'
 import Modal from './components/Modal.jsx'

function App() {
  const [file, setFile] = useState(null); // 文件信息
  const [editorText, setEditorText] = useState('') // 编译器中的内容，拆分题目后和预览区内容不一致
  const [content, setContent] = useState(''); // 预览区内容的html
  const [problems, setProblems] = useState([]) // 拆分后的题，不含标签结构
  const [imgUrls, setImgUrls] = useState([]) // 上传图片存储的url
  const uploadRef = useRef(null);
  const [lineArr, setLineArr] = useState([])
  
  // 上传文件
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 编辑富文本中的内容，同步到预览区中
  const handleChangeEditor = (value) => {
    // setContent(value)
    setEditorText(value)
    setLineArr(getLines(value))
  }

  // 解析Word文件，把图片上传到服务器后，替换图片的url
  const parseWordFile = async () => {
    if (!file) {
      alert("请选择一个Word文件");
      return;
    }

    try {
      const fileReader = new FileReader();
      fileReader.onloadend = async (ev) => {
        const arrayBuffer = ev.target.result;
        const options = {
          styleMap: [
            "p[style-name^='Heading'] => p:fresh",
            "u => em.underline",
            "strike => del",
          ],
        }; // 自定义样式映射
        const result = await mammoth.convertToHtml({ arrayBuffer, options });
        setContent(result.value);
        // console.log(result.value);
        await uploadImages(result.value)
      };
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("解析Word文件时出错:", error);
      alert("解析Word文件时出错");
    }
  };

  // 拆题，拆题的数据源必须是编辑器中的内容
  const formatWord = (problemSplitType) => {
    const initProblemArr = splitproblem(lineArr, problemSplitType)
    console.log('initProblemArr',initProblemArr);
    setProblems(initProblemArr)
  }

  const uploadImages = async (htmlContent) => {
    // 正则表达式匹配data: URLs
    const imgRegex = /src="data:image\/[a-zA-Z]*;base64,([^"]*)"/g;
    let match;

    if((match = imgRegex.exec(htmlContent)) === null){
      setEditorText(htmlContent)
      if(window.tinymce){
       window.tinymce.get('myEditor').setContent(htmlContent)
       } 
       setContent(getLines(htmlContent)?.join(''))
       setLineArr(getLines(htmlContent))
      return;
    }
  
    while ((match = imgRegex.exec(htmlContent)) !== null) {
        const b64Data = match[1];
        // 将图片上传到服务器，并返回图片的URL
        await uploadRef?.current?.uploadGetAsFile([
          dataURLtoFile(b64Data, `${getUuid()}.png`),
        ]);
    }
  }

  // 替换图片的url
  const replaceImages = (htmlContent, imgUrls = []) => {
    const imgRegex = /src="data:image\/[a-zA-Z]*;base64,([^"]*)"/g;
    let match;
    let replacedContent = htmlContent;
    let imgCount = 0; // 计算匹配到的base64图片数量

    // 重置正则表达式的lastIndex属性，确保每次执行exec时从头开始查找
    imgRegex.lastIndex = 0;

    while ((match = imgRegex.exec(htmlContent)) !== null) {
        imgCount++; // 每找到一个匹配就增加计数
        // 确保imgUrls中有足够的元素进行替换，避免数组越界
        if (imgCount <= imgUrls.length) {
            // 从imgUrls中获取当前索引对应的URL进行替换
            const imageUrl = imgUrls[imgCount - 1]; // 因为数组索引从0开始，所以减1
            replacedContent = replacedContent.replace(match[0], `src="${imageUrl}"`);
        } else {
            console.warn(`Not enough URLs provided. Only replaced ${imgUrls.length} out of ${imgCount} images.`);
            break; // 如果imgUrls不足，停止替换
        }
    }

    return replacedContent;
  }

  // 只有在上传完成后，才会触发
  useEffect(() => {
    if(imgUrls.length){
     const result = replaceImages(content, imgUrls)
     setEditorText(result)
     if(window.tinymce){
       window.tinymce.get('myEditor').setContent(result)
     }
     setContent(getLines(result)?.join(''))
     setLineArr(getLines(result))
    }
  },[imgUrls])

  return (
    <div>
      <Space>
        <input type="file" accept=".docx" onChange={handleFileChange} />
        <Button type="primary" onClick={parseWordFile}>
          识别Word文件
        </Button>
        <Modal onOk={(keyWords) => formatWord(keyWords)}/>
      </Space>
      <Row gutter={24}>
        <Col span={10}>
          <div id="editor">
            <MyEditor onChange={handleChangeEditor}/>
          </div>
        </Col>
        <Col span={14}>
          <div style={{height: '80vh', overflow:'scroll'}}>
          {problems.map((pro, index) => {
           return <div key={index} style={{border: '1px solid black', padding:'10px'}} >
            题干body:<p dangerouslySetInnerHTML={{ __html: pro.body }}></p>
            <p dangerouslySetInnerHTML={{ __html: pro.initChoices }}></p>
            <p dangerouslySetInnerHTML={{ __html: pro.answer }}></p>
            <p dangerouslySetInnerHTML={{ __html: pro.analysis }}></p>
            <p dangerouslySetInnerHTML={{ __html: pro.explains}}></p>
            小问:
            {pro.subproblems && pro.subproblems?.map((el,i) => {
              return <>
              <p key={i} dangerouslySetInnerHTML={{ __html: el?.body}}></p>
              <p dangerouslySetInnerHTML={{ __html: el?.explains }}></p>
              </>
            })}
            <p style={{color: 'red'}}>其他：{ pro.content }</p>
           </div>
          })}
         </div>
        </Col>
      </Row>
      <Uploader 
        ref={uploadRef} 
        onSuccess={(file) => {;
          const imgUrls = file.map(el => el.url)
          setImgUrls(imgUrls)
        }}
      />
    </div>
  );
}

export default App;
