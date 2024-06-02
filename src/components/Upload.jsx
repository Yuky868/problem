import { forwardRef, useImperativeHandle, useRef } from 'react'
import { Button, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import '@guanghe-pub/yc-pc-upload-react/dist/yc-pc-upload.min.css';
import YcPcUpload from '@guanghe-pub/yc-pc-upload-react/dist/yc-pc-upload.min.js';
import { getToken } from '../server/index'

const Uploader = forwardRef(
    ({
      fileList = [],
      accept = 'image/*',
      listType = '',
      onFileSuccess = () => {},
      onSuccess = () => {},
      onRemove = () => {},
      onError = () => {},
      onPreview = () => {},
      children,
      ...rest
    },
    ref
  ) => {
    const uploadRef = useRef()
    const getupToken = async () => {
      const res = await getToken()
      return res?.data?.data?.token
    }

    useImperativeHandle(ref, () => ({
      uploadGetAsFile: (pasteFile) => {
        uploadRef.current.uploadFiles(pasteFile)
      }
    }))
    return (
        <YcPcUpload
          ref={uploadRef}
          listType={listType}
          accept={accept}
          env='test'
          getToken={getupToken}
          fileList={fileList}
          fileListUploadEndHandler={onSuccess}
          fileUploadEndHandler={onFileSuccess}
          removeHandler={onRemove}
          fileUploadErrorHandler={onError}
          previewHandler={onPreview}
          exceedLimitHandler={(files) => message.error('文件个数超出限制')}
          exceedSizeHandler={(file, files) =>
            message.error('文件大小超出限制')
          }
          uploadSlots={{
            trigger: () =>
              children || (
                <Button icon={<PlusOutlined />} type='text'>
                  请选择
                </Button>
              )
          }}
          filePath={'pdc'}
          {...rest}
        />)
  }
)

export default Uploader
