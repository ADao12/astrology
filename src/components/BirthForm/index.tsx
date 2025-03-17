import React, { useState, useEffect } from 'react';
import { Form, DatePicker, Radio, Button, Input, Modal, List, Space } from 'antd';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Lunar } from 'lunar-typescript';
import type { BirthData } from '../../core/types';
import moment from 'moment';

interface BirthFormProps {
  onSubmit: (data: BirthData) => void;
}

interface Location {
  longitude: number;
  latitude: number;
  address: string;
}

interface PoiItem {
  location: {
    lng: number;
    lat: number;
  };
  name: string;
  address: string;
  pname: string;    // 省份名
  cityname: string; // 城市名
  adname: string;   // 区域名
}

export const BirthForm: React.FC<BirthFormProps> = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const [location, setLocation] = useState<Location | null>({
    // 设置高州市的默认位置
    longitude: 110.854020,
    latitude: 21.919654,
    address: '广东省茂名市高州市高州市'
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [lunarDate, setLunarDate] = useState<string>('');

  // 计算农历日期
  const calculateLunarDate = (date: moment.Moment) => {
    const lunar = Lunar.fromDate(date.toDate());
    return `农历 ${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()}`;
  };

  // 处理日期变化
  const handleDateChange = (date: moment.Moment | null) => {
    if (date) {
      const lunarDateStr = calculateLunarDate(date);
      setLunarDate(lunarDateStr);
    }
  };

  // 搜索地点 - 优化搜索功能
  const handleSearch = async (value: string) => {
    if (!value) return;
    
    setSearching(true);
    try {
      const AMap = await AMapLoader.load({
        key: '601f4afcf120d35ba187aae32af9c3f3',
        version: '2.0',
        plugins: ['AMap.PlaceSearch']
      });

      const placeSearch = new AMap.PlaceSearch({
        pageSize: 20,
        extensions: 'all'
      });

      placeSearch.search(value, (status: string, result: any) => {
        setSearching(false);
        if (status === 'complete' && result.info === 'OK') {
          setSearchResults(result.poiList.pois);
        } else {
          setSearchResults([]);
        }
      });
    } catch (error) {
      console.error('搜索失败:', error);
      setSearching(false);
    }
  };

  // 选择地点
  const handleSelectLocation = (poi: PoiItem) => {
    try {
      const newLocation = {
        longitude: poi.location.lng,
        latitude: poi.location.lat,
        address: `${poi.pname}${poi.cityname}${poi.adname}${poi.name}`
      };
      
      setLocation(newLocation);
      setIsModalVisible(false);
      form.setFieldsValue({ 
        birthPlace: newLocation.address
      });
    } catch (error) {
      console.error('处理地点数据失败:', error);
    }
  };

  const handleSubmit = (values: any) => {
    if (!location) {
      return;
    }
    
    const birthDateTime = values.birthDateTime;
    const birthData: BirthData = {
      year: birthDateTime.year(),
      month: birthDateTime.month() + 1,
      day: birthDateTime.date(),
      hour: birthDateTime.hour(),
      minute: birthDateTime.minute(),
      longitude: location.longitude,
      latitude: location.latitude,
      gender: values.gender,
    };
    onSubmit(birthData);
  };

  // 组件挂载时设置默认值
  useEffect(() => {
    form.setFieldsValue({
      birthDateTime: moment('1991-07-12 12:00:00'),
      birthPlace: '广东省茂名市高州市高州市',
      gender: 'male'
    });
  }, [form]);

  return (
    <>
      <Form 
        form={form} 
        onFinish={handleSubmit} 
        layout="vertical"
        style={{ maxWidth: 600, margin: '0 auto' }}
        initialValues={{
          birthDateTime: moment('1991-07-12 12:00:00'),
          birthPlace: '广东省茂名市高州市高州市',
          gender: 'male'
        }}
      >
        <Form.Item 
          label={
            <Space>
              <span>出生日期时间</span>
              {lunarDate && <span style={{ color: '#666' }}>({lunarDate})</span>}
            </Space>
          }
          name="birthDateTime"
          rules={[{ required: true, message: '请选择出生日期时间' }]}
        >
          <DatePicker 
            showTime 
            style={{ width: '100%' }}
            placeholder="选择出生日期和时间"
            onChange={handleDateChange}
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>

        <Form.Item 
          label="出生地点" 
          name="birthPlace"
          rules={[{ required: true, message: '请选择出生地点' }]}
          extra="请输入详细地址，如：广东省高州市某某镇/街道"
        >
          <Input
            readOnly
            placeholder="点击选择出生地点"
            onClick={() => setIsModalVisible(true)}
          />
        </Form.Item>

        {location && (
          <div style={{ 
            marginBottom: 16, 
            padding: 16, 
            background: '#f5f5f5', 
            borderRadius: 4 
          }}>
            <div>选中位置：{location.address}</div>
            <div>经度：{location.longitude.toFixed(6)}</div>
            <div>纬度：{location.latitude.toFixed(6)}</div>
          </div>
        )}

        <Form.Item 
          label="性别" 
          name="gender"
          rules={[{ required: true, message: '请选择性别' }]}
        >
          <Radio.Group>
            <Radio value="male">男</Radio>
            <Radio value="female">女</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block
            disabled={!location}
          >
            生成命盘
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="选择出生地点"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Input.Search
          placeholder="请输入地址，如：广东省高州市"
          onSearch={handleSearch}
          loading={searching}
          enterButton
          style={{ marginBottom: 16 }}
        />
        
        <List
          size="small"
          bordered
          dataSource={searchResults}
          loading={searching}
          renderItem={(item: PoiItem) => (
            <List.Item 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelectLocation(item)}
            >
              <List.Item.Meta
                title={item.name}
                description={
                  <div>
                    <div>{item.address}</div>
                    <div style={{ color: '#999', fontSize: '12px' }}>
                      {item.pname} {item.cityname} {item.adname}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: searching ? '搜索中...' : '没有找到匹配的地址，请尝试输入更详细的地址'
          }}
        />
      </Modal>
    </>
  );
}; 