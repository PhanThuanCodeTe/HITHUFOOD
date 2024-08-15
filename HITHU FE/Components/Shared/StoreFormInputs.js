import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Styles from './Styles';

const StoreFormInputs = ({ 
  name, 
  setName, 
  description, 
  setDescription, 
  district, 
  setDistrict, 
  ward, 
  setWard, 
  houseStreet, 
  setHouseStreet, 
  wards, 
  handleDistrictChange, 
  data // Pass data as a prop
}) => {
  return (
    <>
      <Text style={Styles.title}>Tên cửa hàng:</Text>
      <TextInput style={Styles.input} value={name} onChangeText={setName} />

      <Text style={Styles.title}>Mô tả chi tiết cửa hàng:</Text>
      <TextInput style={Styles.input} value={description} onChangeText={setDescription} />

      <Text style={Styles.title}>Nhập Quận tại thành phố Hồ Chí Minh:</Text>
      <Picker
        selectedValue={district}
        onValueChange={(itemValue) => handleDistrictChange(itemValue)}
        style={Styles.picker}
      >
        <Picker.Item label="Chọn Quận" value="" />
        {data.districts.map((district) => (
          <Picker.Item key={district.code} label={district.name} value={district.name} />
        ))}
      </Picker>

      <Text style={Styles.title}>Nhập Phường/Xã:</Text>
      <Picker
        selectedValue={ward}
        onValueChange={(itemValue) => setWard(itemValue)}
        style={Styles.picker}
        enabled={wards.length > 0}
      >
        <Picker.Item label="Chọn Phường/Xã" value="" />
        {wards.map((ward) => (
          <Picker.Item key={ward.code} label={ward.name} value={ward.name} />
        ))}
      </Picker>

      <Text style={Styles.title}>Nhập Số nhà và Tên Đường:</Text>
      <TextInput 
        style={Styles.input} 
        value={houseStreet} 
        onChangeText={setHouseStreet}
      />
    </>
  );
};

export default StoreFormInputs;
