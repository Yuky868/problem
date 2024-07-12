// eslint-disable-next-line no-unused-vars
import { useState, useEffect, useRef } from "react";
import * as mammoth from "mammoth";
import { Space, Row, Col, Button, Card } from "antd";
import MyEditor from "./components/Editor";
import {getUuid, dataURLtoFile  } from './utils/index'
import "./App.css";
import Uploader from './components/Upload.jsx'
import { getLines, splitproblem } from './utils/test.js'
import Modal from './components/Modal.jsx'
import styled from 'styled-components';


const StyledDiv = styled.div`
p {
  margin: 0;
  text-align: start;
}
table {
  border-collapse: collapse;
}
`;

function App() {
  const [file, setFile] = useState(null); // 文件信息
  const [editorText, setEditorText] = useState('') // 编译器中的内容，拆分题目后和预览区内容不一致
  const [content, setContent] = useState(''); // 预览区内容的html，只在第一次解析文档时用了一下
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
        setLineArr(getLines(result.value))
        if(window.tinymce){
          window.tinymce.get('myEditor').setContent(result.value)
        }
      };
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("解析Word文件时出错:", error);
      alert("解析Word文件时出错");
    }
  };

  // 拆题，拆题的数据源必须是编辑器中的内容
  const formatWord = (problemSplitType) => {
    // console.log('problemSplitType',problemSplitType);
    // return
    const initProblemArr = splitproblem(lineArr, problemSplitType)
    processObjects(initProblemArr).then((result) => {
      console.log('result',result);
    })
    setProblems(initProblemArr)
  }

  const uploadBase64Image = (base64Image) => {
    base64Image.forEach(async (item)=> {
      await uploadRef?.current?.uploadGetAsFile([
        dataURLtoFile(item, `${getUuid()}.png`),
      ]);
    });
  }

  // 收集所有Base64图片数据
  const collectBase64Images = (field, imagesArray) => {
    const base64ImageRegex = /<img[^>]+src=["']data:image\/\w+;base64,(.*?)["'][^>]*>/gi;
    let match;
    while ((match = base64ImageRegex.exec(field)) !== null) {
      imagesArray.push(match[1]);
    }
  }
// 替换字段中的Base64图片为URL
function replaceBase64ImagesInField(field, urlsMap) {
  return field.replace(/<img[^>]+src=["']data:image\/\w+;base64,(.*?)["'][^>]*>/gi, (match, base64Image) => {
    const url = urlsMap.get(base64Image);
    return `<img src="${url}">`;
  });
}

  const uploadSuccess = (file) => {
    const imgUrls = file.map(el => el.url)
    setImgUrls(imgUrls)
  }

  const [imagesToUpload, setImagesToUpload] = useState([])
  async function processObjects(arrayOfObjects) {
    const imagesToUpload = [];
    
    // 首先收集所有需要上传的Base64图片数据
    for (const object of arrayOfObjects) {
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          const value = object[key];
          if (typeof value === 'string') {
            collectBase64Images(value, imagesToUpload);
          } else if (key === 'choices' && Array.isArray(value)) {
            for (const choice of value) {
              if (typeof choice.body === 'string') {
                collectBase64Images(choice.body, imagesToUpload);
              }
            }
          }
        }
      }
    }
    setImagesToUpload(imagesToUpload)
    // 上传所有收集到的图片
    await uploadBase64Image(imagesToUpload);
  }

  const replacebase64tourl = (urlsMap, problemArr) => {
    const newproblems = problemArr.map(problem => ({ ...problem }));
    for (const object of newproblems) {
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          let value = object[key];
          if (typeof value === 'string') {
            object[key] = replaceBase64ImagesInField(value, urlsMap);
          } else if (key === 'choices' && Array.isArray(value)) {
            for (const choice of value) {
              if (typeof choice.body === 'string') {
                choice.body = replaceBase64ImagesInField(choice.body, urlsMap);
              }
            }
          }
        }
      }
    }
    return newproblems
  }

  useEffect(() => {
    // 创建一个映射表，用于快速查找Base64图片对应的URL
    const urlsMap = new Map(imagesToUpload.map((image, index) => [image, imgUrls[index]]));
    const res = replacebase64tourl(urlsMap, problems);
    setProblems(res)
    console.log('problem', res);
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
          <StyledDiv style={{height: '80vh', overflow:'scroll'}}>
            {problems.map((pro, index) => {
            return <Card key={index} style={{ width: 500 }} >
              <p>题号：{index+1}</p>
              <p dangerouslySetInnerHTML={{ __html: pro.body }} style={{fontWeight: 600}}></p>
              {pro?.choices && pro.choices?.map((el,i) => {
                return <p key={el.num} style={el.correct ? {color: 'red'} : {}}>
                  <span>{el.num}</span><span key={i} dangerouslySetInnerHTML={{ __html: el.body }}></span>
                </p>
              })}          
              {<p style={{fontWeight: 600,color:'red'}}>小问:</p>}
              {pro.subproblems && pro.subproblems?.map((el,i) => {
                return <>
                <p style={{fontWeight: 600}} key={i} dangerouslySetInnerHTML={{ __html: el?.body}}></p>
                <p style={{color: '#666'}} dangerouslySetInnerHTML={{ __html: el?.explains }}></p>
                </>
              })}
              <p style={{fontWeight: 600}}>答案:</p>
              <p dangerouslySetInnerHTML={{ __html: pro.answer }}></p>
              <p style={{fontWeight: 600}}>分析:</p>
              <p dangerouslySetInnerHTML={{ __html: pro.analysis }}></p>
              <p style={{fontWeight: 600}}>详解:</p>
              <p dangerouslySetInnerHTML={{ __html: pro.detail }}></p>
              <p style={{fontWeight: 600}}>解析:</p>
              <p dangerouslySetInnerHTML={{ __html: pro.explains}}></p>
            </Card>
            })}
         </StyledDiv>
        </Col>
      </Row>
      <Uploader 
        ref={uploadRef} 
        onSuccess={uploadSuccess}
      />
    </div>
  );
}

export default App;
