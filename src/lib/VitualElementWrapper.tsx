import { Badge, Tooltip, message } from 'antd';

import { LockOutlined } from '@ant-design/icons';
import { GrVirtualMachine } from 'react-icons/gr';
import { TbEditCircleOff } from 'react-icons/tb';

const VirtualElementWrapper = ({ children, style, editMode }) => {
  return (
    <>
      {children}
      {/* 
      {editMode ? (
        <Tooltip mouseEnterDelay={0.3}>
          <div
            data-virtual="true"
            className="relative group"
            style={
              {
                //   ...style,
                //   position: 'relative',
                //   border: '1px dashed #1890ff',
                //   borderRadius: '2px',
                //   padding: '1px',
              }
            }
          >
            <Badge
              count={<TbEditCircleOff className='h-4 w-4' style={{ color: '#1890ff' }} />}
              offset={[-5, 5]}
              style={{
                backgroundColor: '#e6f7ff',
                border: '1px solid #91d5ff',
                borderRadius: '50%',
                padding: '2px',
                zIndex: 10,
              }}
            >
              {children}
            </Badge>
          </div>
        </Tooltip>
      ) : (
        <>

         

        </>
      )} */}
    </>
  );
};

export default VirtualElementWrapper;
