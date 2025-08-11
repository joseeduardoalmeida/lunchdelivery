import { NativeModules } from 'react-native';

const { DeviceInfoModule } = NativeModules;

export const getManufacturer = async () => {
  try {
    const manufacturer = await DeviceInfoModule.getManufacturer();
    return manufacturer;
  } catch (error) {
    console.error('Erro ao obter fabricante:', error);
    return null;
  }
};