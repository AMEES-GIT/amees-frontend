export interface PinData {
  pin: string;
  funcs: string;
  tags: string[];
  avoid: boolean;
  note: string;
}

export const PIN_DATA: Record<string, { name: string, pins: PinData[] }> = {
  esp32: {
    name: 'ESP32 DevKit',
    pins: [
      { pin: 'GPIO0', funcs: 'Boot button, ADC2_CH1, Touch1', tags: ['adc', 'touch'], avoid: true, note: 'Strapping pin, held high at boot. Avoid driving it low.' },
      { pin: 'GPIO1', funcs: 'TX0 (USB serial)', tags: ['uart'], avoid: true, note: 'Used by the USB serial port. Avoid unless you free it.' },
      { pin: 'GPIO2', funcs: 'ADC2_CH2, Touch2, onboard LED', tags: ['adc', 'touch'], avoid: true, note: 'Strapping pin. Must be low or floating at boot.' },
      { pin: 'GPIO3', funcs: 'RX0 (USB serial)', tags: ['uart'], avoid: true, note: 'Used by the USB serial port.' },
      { pin: 'GPIO4', funcs: 'ADC2_CH0, Touch0', tags: ['adc', 'touch'], avoid: false, note: '' },
      { pin: 'GPIO5', funcs: 'VSPI CS', tags: ['spi'], avoid: true, note: 'Strapping pin that outputs PWM at boot.' },
      { pin: 'GPIO12', funcs: 'ADC2_CH5, Touch5, HSPI MISO', tags: ['adc', 'touch', 'spi'], avoid: true, note: 'Strapping pin that sets flash voltage.' },
      { pin: 'GPIO13', funcs: 'ADC2_CH4, Touch4, HSPI MOSI', tags: ['adc', 'touch', 'spi'], avoid: false, note: '' },
      { pin: 'GPIO14', funcs: 'ADC2_CH6, Touch6, HSPI CLK', tags: ['adc', 'touch', 'spi'], avoid: false, note: 'Outputs PWM at boot.' },
      { pin: 'GPIO15', funcs: 'ADC2_CH3, Touch3, HSPI CS', tags: ['adc', 'touch', 'spi'], avoid: true, note: 'Strapping pin that outputs PWM at boot.' },
      { pin: 'GPIO16', funcs: 'UART2 RX', tags: ['uart'], avoid: false, note: 'Not available on WROVER modules.' },
      { pin: 'GPIO17', funcs: 'UART2 TX', tags: ['uart'], avoid: false, note: 'Not available on WROVER modules.' },
      { pin: 'GPIO18', funcs: 'VSPI CLK', tags: ['spi'], avoid: false, note: '' },
      { pin: 'GPIO19', funcs: 'VSPI MISO', tags: ['spi'], avoid: false, note: '' },
      { pin: 'GPIO21', funcs: 'I²C SDA (default)', tags: ['i2c'], avoid: false, note: '' },
      { pin: 'GPIO22', funcs: 'I²C SCL (default)', tags: ['i2c'], avoid: false, note: '' },
      { pin: 'GPIO23', funcs: 'VSPI MOSI', tags: ['spi'], avoid: false, note: '' },
      { pin: 'GPIO25', funcs: 'DAC1, ADC2_CH8', tags: ['adc', 'dac'], avoid: false, note: '' },
      { pin: 'GPIO26', funcs: 'DAC2, ADC2_CH9', tags: ['adc', 'dac'], avoid: false, note: '' },
      { pin: 'GPIO27', funcs: 'ADC2_CH7, Touch7', tags: ['adc', 'touch'], avoid: false, note: '' },
      { pin: 'GPIO32', funcs: 'ADC1_CH4, Touch9', tags: ['adc', 'touch'], avoid: false, note: '' },
      { pin: 'GPIO33', funcs: 'ADC1_CH5, Touch8', tags: ['adc', 'touch'], avoid: false, note: '' },
      { pin: 'GPIO34', funcs: 'ADC1_CH6', tags: ['adc', 'input'], avoid: false, note: 'Input only.' },
      { pin: 'GPIO35', funcs: 'ADC1_CH7', tags: ['adc', 'input'], avoid: false, note: 'Input only.' },
      { pin: 'GPIO36', funcs: 'ADC1_CH0', tags: ['adc', 'input'], avoid: false, note: 'Input only.' },
      { pin: 'GPIO39', funcs: 'ADC1_CH3', tags: ['adc', 'input'], avoid: false, note: 'Input only.' },
    ]
  },
  uno: {
    name: 'Arduino Uno',
    pins: [
      { pin: 'D0', funcs: 'RX (USB serial)', tags: ['uart'], avoid: true, note: 'Shared with USB serial.' },
      { pin: 'D1', funcs: 'TX (USB serial)', tags: ['uart'], avoid: true, note: 'Shared with USB serial.' },
      { pin: 'D2', funcs: 'External interrupt 0', tags: ['int'], avoid: false, note: '' },
      { pin: 'D3', funcs: 'PWM, external interrupt 1', tags: ['pwm', 'int'], avoid: false, note: 'PWM ~490 Hz.' },
      { pin: 'D4', funcs: 'Digital I/O', tags: [], avoid: false, note: '' },
      { pin: 'D5', funcs: 'PWM', tags: ['pwm'], avoid: false, note: 'PWM ~980 Hz.' },
      { pin: 'D6', funcs: 'PWM', tags: ['pwm'], avoid: false, note: 'PWM ~980 Hz.' },
      { pin: 'D7', funcs: 'Digital I/O', tags: [], avoid: false, note: '' },
      { pin: 'D8', funcs: 'Digital I/O', tags: [], avoid: false, note: '' },
      { pin: 'D9', funcs: 'PWM', tags: ['pwm'], avoid: false, note: 'PWM ~490 Hz.' },
      { pin: 'D10', funcs: 'PWM, SPI SS', tags: ['pwm', 'spi'], avoid: false, note: 'PWM ~490 Hz.' },
      { pin: 'D11', funcs: 'PWM, SPI MOSI', tags: ['pwm', 'spi'], avoid: false, note: 'PWM ~490 Hz.' },
      { pin: 'D12', funcs: 'SPI MISO', tags: ['spi'], avoid: false, note: '' },
      { pin: 'D13', funcs: 'SPI SCK, onboard LED', tags: ['spi'], avoid: false, note: '' },
      { pin: 'A0', funcs: 'Analog input, digital 14', tags: ['adc'], avoid: false, note: '' },
      { pin: 'A1', funcs: 'Analog input, digital 15', tags: ['adc'], avoid: false, note: '' },
      { pin: 'A2', funcs: 'Analog input, digital 16', tags: ['adc'], avoid: false, note: '' },
      { pin: 'A3', funcs: 'Analog input, digital 17', tags: ['adc'], avoid: false, note: '' },
      { pin: 'A4', funcs: 'Analog input, I²C SDA', tags: ['adc', 'i2c'], avoid: false, note: '' },
      { pin: 'A5', funcs: 'Analog input, I²C SCL', tags: ['adc', 'i2c'], avoid: false, note: '' },
    ]
  }
};

export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'adc', label: 'ADC' },
  { id: 'pwm', label: 'PWM' },
  { id: 'i2c', label: 'I²C' },
  { id: 'spi', label: 'SPI' },
  { id: 'uart', label: 'UART' },
  { id: 'avoid', label: 'Avoid' },
];