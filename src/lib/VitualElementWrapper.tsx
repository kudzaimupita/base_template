import { Badge, Tooltip, message } from 'antd';

import { LockOutlined } from '@ant-design/icons';

const VirtualElementWrapper = ({ children, style, editMode }) => {
  return (
    <>
      {editMode ? (
        <Tooltip title="Virtual Element - Cannot be edited, resized, or dragged" mouseEnterDelay={0.3}>
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
              count={<LockOutlined style={{ color: '#1890ff' }} />}
              offset={[-5, 5]}
              style={{
                backgroundColor: '#e6f7ff',
                border: '1px solid #91d5ff',
                borderRadius: '50%',
                padding: '4px',
                zIndex: 10,
              }}
            >
              {children}
            </Badge>
          </div>
        </Tooltip>
      ) : (
        <>
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
            {children}
          </div>
        </>
      )}
    </>
  );
};

export default VirtualElementWrapper;
