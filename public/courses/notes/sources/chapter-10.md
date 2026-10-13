# 微机原理与接口技术 · 第10章《模拟量模块》知识点全梳理

> 本文整理自福州大学《微机原理与接口技术》吴衔誉教授第十章课件，系统讲解 ADC 的工作原理及性能指标、STM32 的 ADC 概述、ADC 配置、ADC 应用特征及中断请求、ADC 寄存器及库函数，以及 DAC 的工作原理及性能指标六大板块。

---

## 目录

- [一、ADC 的工作原理及性能指标](#一adc-的工作原理及性能指标)
- [二、STM32 的 ADC 概述](#二stm32-的-adc-概述)
- [三、STM32 的 ADC 配置](#三stm32-的-adc-配置)
- [四、STM32 的 ADC 应用特征及中断请求](#四stm32-的-adc-应用特征及中断请求)
- [五、STM32 的 ADC 寄存器及库函数](#五stm32-的-adc-寄存器及库函数)
- [六、DAC 的工作原理及性能指标](#六dac-的工作原理及性能指标)
- [本章小结与思考题](#本章小结与思考题)

---

## 一、ADC 的工作原理及性能指标

现实世界的信号大多是模拟量（温度、光照、电压），而单片机只能处理数字量。模数转换器（ADC，Analog to Digital Converter）把模拟量变成数字量，数模转换器（DAC，Digital to Analog Converter）反过来把数字量变成模拟量，二者共同构成单片机感知和控制物理世界的桥梁。

### 1.1 模数转换器的工作原理

根据转换原理不同，ADC 可分为计数-比较式、逐次逼近式和双斜率积分式。计数-比较式结构简单、价格便宜但转换速度慢，较少采用。下面介绍最常用的两种。

**（1）逐次逼近式模数转换器**

逐次逼近式 ADC（简称 SAR ADC，Successive Approximation Register ADC，逐次逼近寄存器型模数转换器）主要由逐次逼近寄存器（SAR）、数字 / 电压转换器（即 D/A 转换器）、比较器、时序及控制逻辑等部分组成。它是采样速率低于 5 Msps 的中高分辨率 ADC 应用的常见结构，分辨率一般为 8~16 位，具有低功耗、小尺寸的特点。

工作原理（二分搜索的思想）：

- ADC 收到「转换命令」并清除 SAR 后，控制电路先设定 SAR 最高位为 1、其余为 0，预测数据送 D/A 转换器，转换成电压 Vc；
- 将 Vc 与输入模拟电压 Vx 在高增益比较器中比较：若 Vx ≥ Vc，说明该位置 1 正确，予以保留；若 Vx < Vc，说明置 1 不合适，予以清除；
- 按此法对次高位继续转换、比较、判断，逐位确定是 1 还是 0；
- 重复至确定 SAR 最低位为止。完成后状态线改变，SAR 中的内容就是与输入模拟电压对应的二进制数字代码。

**（2）双积分式模数转换器**

双积分式的抗干扰能力比逐次逼近式强，精度高、抗干扰强。其基础是测量两个时间：模拟输入电压向电容充电的固定时间，以及在已知参考电压下放电所需的时间；模拟输入电压与参考电压的比值等于这两个时间值之比。

不过，由于逐次逼近式能很好地兼顾速度与精度，在 16 位以下的 ADC 中逐次逼近式使用得更多。

### 1.2 模数转换器的性能指标

选择 ADC 需综合考虑分辨率、通道、基准电压、转换速率、采样 / 保持器、量程、满刻度误差、线性度、数字接口方式、模拟信号类型、电源电压、功耗、封装等因素。

1. **分辨率**：能分辨最小信号的能力，表示数字量变化一个相邻数码所需输入模拟电压的变化量，常用输出二进制位数表示。分辨率越高，对输入变化越灵敏。例如 8 位 ADC 能分辨满刻度的 1/256，若满刻度 5 V，则最小可分辨 5 V / 256 ≈ 19.5 mV。常见有 8、10、12、14、16 位；
2. **通道**：多芯片内含多个 ADC 可同时转换多路；常见的多路 ADC 只有一个公共 ADC，由多路开关分时转换；
3. **基准电压**：分内 / 外基准和单 / 双基准；
4. **转换速率**：转换时间（从启动到输出稳定数字量所需时间）的倒数，即每秒完成转换的次数。逐次逼近式典型转换时间 1.0~200 μs。转换速率应高于系统要求的采样频率；
5. **采样 / 保持器**：采集直流或缓变信号时可不用；其他信号一般要加；若信号频率不高且 ADC 转换时间短（高速 ADC），也可不用；
6. **量程**：所能转换的电压范围，如 2.5 V、5 V、10 V；
7. **满刻度误差**：满刻度输出时对应输入信号与理想值之差；
8. **线性度**：实际转移函数与理想直线的最大偏移；
9. **数字接口方式**：分并行和串行。并行引脚多但速度快；串行引脚少、封装小，但需软件处理；I/O 紧张时用串行，速度要求高时用并行；
10. **模拟信号类型**：通常是电压信号，分单极性（Unipolar）和双极性（Bipolar）；
11. **电源电压**：分单电源、双电源和不同电压范围；
12. **功耗**：CMOS 工艺功耗低，电池供电手持系统要重点关注；
13. **封装**：常见 DIP（Dual In-line Package，双列直插封装）和 SMD（Surface Mount Devices，表贴型封装）。

> **记忆点**：本节是原理地基。SAR ADC 是「逐位试凑、二分逼近」，双积分式是「充放电时间比」，后者抗干扰强但慢，16 位以下 SAR 更常用。13 项指标里分辨率、转换速率、量程、基准电压、接口方式是选型的硬门槛。

---

## 二、STM32 的 ADC 概述

STM32F103VET6 集成有 18 路 12 位高速逐次逼近型 ADC，可测量 16 个外部和 2 个内部信号源。各通道可单次、连续、扫描或间断模式执行；结果可左对齐或右对齐存储在 16 位数据寄存器；模拟看门狗允许检测输入电压是否超出用户定义的高低阈值；ADC 输入时钟不得超过 14 MHz，由 PCLK2（APB2 Peripheral Clock，APB2 外设时钟）经分频产生。

主要特性：

- 12 位分辨率；
- 转换结束、注入转换结束和模拟看门狗事件时可产生中断；
- 单次和连续转换模式；
- 从通道 0 到通道 n 的自动扫描模式；
- 自校准功能；
- 带内嵌数据一致性的数据对齐；
- 采样间隔可按通道分别编程；
- 规则转换和注入转换均有外部触发选项；
- 间断模式；
- 双重模式（带 2 个或以上 ADC 的器件）。

补充特性：转换时间（时钟 56 MHz 时 1 μs，72 MHz 时 1.17 μs）；供电 2.4 V 到 3.6 V；输入范围 VREF− ≤ VIN ≤ VREF+；规则通道转换期间有 DMA（Direct Memory Access，直接存储器访问）请求。

相关引脚：模拟电源 VDDA（等效 VDD）、模拟地 VSSA（等效 VSS）、模拟参考正 VREF+、模拟参考负 VREF−、模拟输入 ADCX_IN[15:0]（16 个外部通道）。

---

## 三、STM32 的 ADC 配置

### 3.1 ADC 的开关控制

设置 ADC_CR2 的 ADON 位给 ADC 上电：第一次置 ADON 唤醒 ADC，上电延迟 tSTAB 后再置 ADON 开始转换；清除 ADON 停止转换并进入断电模式（仅耗电几 μA）。

### 3.2 ADC 时钟

ADCCLK 由 RCC（Reset and Clock Control，复位和时钟控制）提供的专用可编程预分频器产生，并与 PCLK2（APB2 时钟）同步。注意 ADCCLK 不得超过 14 MHz。

### 3.3 通道选择

转换分两组：**规则组**和**注入组**。

- **规则组**：最多 16 个转换通道，按指定顺序逐个转换，结束后从头循环。规则通道及顺序在 ADC_SQRx 中选择，总数写入 ADC_SQR1 的 L[3:0]（0000=1 个，…，1111=16 个）。SQ16[4:0] 定义第 16 个转换的通道编号（0~17）；另有 ADC_SQR2（通道 12~7）、ADC_SQR3（通道 6~1）；
- **注入组**：最多 4 个转换通道，可临时中断规则组去转换这些通道。注入通道及顺序在 ADC_JSQR 中选择，总数写入 JL[1:0]（00=1，01=2，10=3，11=4）。注意若 JL 小于 4，转换顺序从（4−JL）开始。例：`ADC_JSQR[21:0] = 10 00011 00011 00111 00010` 表示扫描顺序为 7、3、3，而非 2、7、3。

若转换期间改 SQRx/JSQR，当前转换被清除并重新启动新组。内部通道：温度传感器接 ADC1_IN16，内部参考电压 VREFINT 接 ADC1_IN17，只能出现在 ADC1 中。

### 3.4 单次转换模式

CONT=0。ADC 只执行一次转换，可由 ADON（仅规则通道）或外部触发启动。

- 规则通道完成：数据存入 16 位 ADC_DR，EOC（End Of Conversion，转换结束）置位，若 EOCIE=1 则中断；
- 注入通道完成：数据存入 16 位 ADC_JDRx，JEOC（Injected End Of Conversion，注入转换结束）置位，若 JEOCIE=1 则中断。然后 ADC 停止。

### 3.5 连续转换模式

CONT=1。当前转换一结束马上启动下一次，可由外部触发或 ADON 启动。每个转换后同样置 EOC/JEOC 并产生中断。

### 3.6 时序图

ADC 精确转换前需稳定时间 tSTAB；开始转换后 14 个时钟周期，EOC 被置位，16 位 ADC_DR 含结果。

### 3.7 模拟看门狗

若被转换电压低于低阈值或高于高阈值，AWD（Analog WatchDog，模拟看门狗）状态位置位。阈值位于 ADC_HTR（高）和 ADC_LTR（低）寄存器的最低 12 位；设 ADC_CR1 的 AWDIE 可允许中断。通过 ADC_CR1，看门狗可作用于 1 个或多个通道。

### 3.8 扫描模式

设 ADC_CR1 的 SCAN 位（0 关闭，1 使用）即选扫描模式。ADC 扫描所有被 SQRx（规则）或 JSQR（注入）选中的通道，每组每通道执行单次转换，每转换结束自动转下一通道；若设了 CONT，则到末通道后不停止，从首通道继续。

### 3.9 注入通道管理

- **触发注入**：清 JAUTO、设 SCAN，规则转换期间来外部注入触发，当前转换被复位，注入序列以单次扫描转换，之后恢复原规则通道；若注入期间来规则事件，注入不被中断，规则序列在注入结束后执行。注意触发事件间隔要长于注入序列；
- **自动注入**：设 JAUTO=1，规则组之后自动转换注入组，可转换 SQRx+JSQR 中最多 20 个序列；此模式须禁止注入外部触发；若同时设 CONT，规则→注入序列连续执行。

### 3.10 间断模式

- **规则组**：设 ADC_CR1 的 DISCEN 激活，执行 n 次（n≤8，由 DISCNUM[2:0] 给出）转换的子组，外部触发启动下一轮 n 次，总序列长由 L[3:0] 定义。例 n=3、通道 0/1/2/3/6/7/9/10：第 1 次触发转 0/1/2，第 2 次转 3/6/7，第 3 次转 9/10 且产生 EOC，第 4 次重新转 0/1/2；
- **注入组**：设 JDISCEN 激活，外部触发后按 JSQR 顺序逐个转换子组，总序列长由 JL[1:0] 定义。例 n=1、通道 1/2/3：第 1 次转 1，第 2 次转 2，第 3 次转 3 并产生 EOC/JEOC，第 4 次重新转 1。

> **记忆点**：本节是 STM32 ADC 的配置核心。规则组是「常规轮询队列」（最多 16 通道），注入组是「可插队的优先队列」（最多 4 通道、优先级更高、能打断规则组）。单次 / 连续 / 扫描 / 间断 4 种模式决定转换的起停与轮转方式，扫描 + 连续 + DMA 是多通道采集的经典组合。

---

## 四、STM32 的 ADC 应用特征及中断请求

### 4.1 校准

ADC 有内置自校准模式，可减小内部电容组变化造成的误差。设 ADC_CR2 的 CAL 位启动；校准结束 CAL 硬件复位，建议每次上电后校准一次。启动校准前，ADC 须处于关电状态（ADON=0）至少两个 ADCCLK；校准码存于 ADC_DR。

### 4.2 数据对齐

ADC_CR2 的 ALIGN 位选对齐：ALIGN=0 右对齐，ALIGN=1 左对齐。注入组结果已减去 ADC_JOFRx 定义的偏移量，可为负值（SEXT 为扩展符号位）；规则组只有 12 位，无偏移。

### 4.3 可编程的通道采样时间

每个通道采样周期数由 ADC_SMPR1/2 的 SMPx[2:0] 设定，各通道可不同。总转换时间：

```
TCONV = 采样时间 + 12.5 周期
```

例：ADCCLK=14 MHz、采样时间 1.5 周期时，TCONV = 1.5 + 12.5 = 14 周期 = 1 μs。SMPx 取值对照：000=1.5、001=7.5、010=13.5、011=28.5、100=41.5、101=55.5、110=71.5、111=239.5 周期。

### 4.4 外部触发转换

设 EXTTRIG（ADC_CR2.20）和 JEXTTRIG 位后，外部事件（定时器捕获、EXTI 线等）可触发转换；EXTSEL[2:0] 和 JEXTSEL[2:0] 从 8 个可能事件中选触发源。外部触发只认上升沿；软件触发可对 SWSTART（规则）或 JSWSTART（注入）置 1 产生。规则组转换可被注入触发打断。

### 4.5 DMA 请求

规则组转换值都存在同一个 ADC_DR 中，多规则通道转换时须用 DMA 避免数据丢失；只有规则组结束才产生 DMA 请求。仅 ADC1 和 ADC3 有 DMA 功能，ADC2 的数据可通过双 ADC 模式借 ADC1 的 DMA 传输。

### 4.6 双 ADC 模式

带 2 个或以上 ADC 的产品可用双 ADC 模式，由 ADC1_CR1 的 DUALMOD[2:0] 选模式，启动可为主（ADC1）从（ADC2）交替或同步触发。共有 6 种基本模式：同步注入、同步规则、快速交叉、慢速交叉、交替触发、独立模式；并可组合出同步注入 + 同步规则、同步规则 + 交替触发、同步注入 + 交叉等混合模式。

| 双 ADC 模式 | 适用通道组 | 要点 |
| --- | --- | --- |
| 同步注入 | 注入组 | ADC1 触发同时给 ADC2 同步触发，结束存各自 JDRx，全转换完产生 JEOC |
| 同步规则 | 规则组 | ADC1 触发同步给 ADC2，产生 32 位 DMA（高半字 ADC2、低半字 ADC1），全完产生 EOC |
| 快速交叉 | 规则组（单通道） | ADC2 立即启动，ADC1 延迟 7 个 ADCCLK 启动，可连续交叉转换 |
| 慢速交叉 | 规则组（单通道） | ADC2 立即启动，ADC1 延迟 14 个 ADCCLK，之后每 14 周期循环 |
| 交替触发 | 注入组 | 第 1 次触发转 ADC1 注入组，第 2 次转 ADC2，循环 |
| 独立模式 | — | 双 ADC 同步不工作，各自独立 |

### 4.7 温度传感器

温度传感器测环境温度（TA），内部接 ADC1_IN16，推荐采样时间 17.1 μs；VREFINT 接 ADC1_IN17。不用时可置关电模式。传感器输出电压随温度线性变化，但不同芯片曲线偏移不同，更适合测变化而非绝对温度；精确测量建议外置传感器。读数步骤：

1. 选 ADC1_IN16；
2. 采样时间 17.1 μs；
3. 设 ADC_CR2 的 TSVREFE 唤醒传感器；
4. 设 ADON 启动（或外部触发）；
5. 读数据寄存器得 VSENSE；
6. 按公式换算：`温度 = (V25 − VSENSE) / Avg_Slope + 25`（V25 为 25 ℃ 时 VSENSE 典型值 1.43 V，Avg_Slope 为典型值 4.3 mV/℃）。例 VSENSE=1.3 V 时：(1.43−1.3)/0.0043 + 25 ≈ 55.23 ℃。

### 4.8 中断请求

规则组和注入组转换结束、模拟看门狗置位都能产生中断，各有独立中断使能位。

> **记忆点**：本节是 ADC 的「高级玩法」。校准提升精度、对齐影响数据存放格式、采样时间公式决定转换耗时；外部触发 + DMA 是多通道高速采集的关键；双 ADC 模式用 6 种组合把两个 ADC 协同起来；温度传感器和内部参考电压挂 ADC1 的 16/17 通道。

---

## 五、STM32 的 ADC 寄存器及库函数

### 5.1 STM32 的 ADC 寄存器

ADC1 起始地址 0x4001_2400，ADC2 为 0x4001_2800，ADC3 为 0x4001_3C00。主要寄存器：

| 寄存器 | 偏移 | 作用 |
| --- | --- | --- |
| ADC_SR | 0x00 | 状态：STRT/JSTRT/JEOC/EOC/AWD |
| ADC_CR1 | 0x04 | 控制 1：AWDEN/JAWDEN、DUALMOD、DISCNUM、SCAN、JAUTO、DISCEN 等 |
| ADC_CR2 | 0x08 | 控制 2：ADON、CONT、CAL、ALIGN、EXTTRIG/EXTSEL、JEXTTRIG/JEXTSEL、SWSTART 等 |
| ADC_SMPR1/2 | 0x0C/0x10 | 采样时间 SMPx |
| ADC_JOFR1~4 | 0x14~0x20 | 注入通道偏移 |
| ADC_HTR/LTR | 0x24/0x28 | 看门狗高低阈值 |
| ADC_SQR1/2/3 | 0x2C/0x30/0x34 | 规则序列 |
| ADC_JSQR | 0x38 | 注入序列 |
| ADC_JDR1~4 | 0x3C~0x48 | 注入数据 |
| ADC_DR | 0x4C | 规则数据（课件此处误写为 0x30/34，实际偏移为 0x4C） |

### 5.2 STM32 的 ADC 固件库函数

`ADC_TypeDef` 在 `stm32f10x.h` 中定义，成员按 SR/CR1/CR2/SMPR1/SMPR2/JOFR1~4/HTR/LTR/SQR1~3/JSQR/JDR1~4/DR 顺序排列。外设基地址：ADC1 在 APB2+0x2400，ADC2 在 APB2+0x2800。

**ADC_InitTypeDef**（定义于 `stm32f10x_adc.h`）：

```c
typedef struct {
    u32 ADC_Mode;                            // 工作模式（独立 / 双 ADC 等）
    FunctionalState ADC_ScanConvMode;        // 扫描模式 ENABLE/DISABLE
    FunctionalState ADC_ContinuousConvMode;  // 连续模式 ENABLE/DISABLE
    u32 ADC_ExternalTrigConv;                // 外部触发源
    u32 ADC_DataAlign;                       // 数据对齐 左 / 右
    u8  ADC_NbrOfChannel;                    // 规则转换通道数 1~16
} ADC_InitTypeDef;
```

常用函数：

1. **ADC_Init**：`void ADC_Init(ADC_TypeDef* ADCx, ADC_InitTypeDef* ADC_InitStruct)` — 按结构体初始化 ADCx（x=1/2/3）；
2. **ADC_ITConfig**：`void ADC_ITConfig(ADC_TypeDef* ADCx, u16 ADC_IT, FunctionalState NewState)` — 使能 / 除能指定 ADC 中断；
3. **ADC_SoftwareStartConvCmd**：`void ADC_SoftwareStartConvCmd(ADC_TypeDef* ADCx, FunctionalState NewState)` — 使能 / 除能软件启动转换；
4. **ADC_RegularChannelConfig**：`void ADC_RegularChannelConfig(ADC_TypeDef* ADCx, uint8_t ADC_Channel, uint8_t Rank, uint8_t ADC_SampleTime)` — 设置规则组通道、顺序和采样时间；
5. **ADC_GetConversionValue**：`u16 ADC_GetConversionValue(ADC_TypeDef* ADCx)` — 返回最近一次规则组转换结果。

**工程应用步骤**：

1. 使能 ADC 时钟及对应 GPIO 时钟；
2. GPIO 引脚设为 `GPIO_Mode_AIN`（模拟输入）；
3. `RCC_ADCCLKConfig` 设 ADC 时钟分频因子；
4. `ADC_DeInit` 复位 ADC 模块；
5. `ADC_Init` 初始化（模式、扫描、连续、对齐、通道数等）；
6. `ADC_RegularChannelConfig` 配置规则通道；
7. `ADC_Cmd` 使能 ADC；
8. `ADC_ResetCalibration` 复位校准，等 `ADC_GetResetCalibrationStatus` 为 1 结束；`ADC_StartCalibration` 校准，等 `ADC_GetCalibrationStatus` 完成；
9. `ADC_SoftwareStartConvCmd` 软件启动；
10. `ADC_GetFlagStatus(ADC_FLAG_EOC)` 等待转换结束（或用中断）；
11. `ADC_GetConversionValue` 读结果并处理。

**例 10-1**：用 STM32F103VET6 的 ADC 通道 1（PA1，接光敏电阻分压）采集电压，结果写到板载 LED 显示。下面整合并修正课件分散代码中的笔误（`Int main`→`int main`、`GPIO_ InitTypeDef` 多余空格、`ADC_ScanConvMode=DISABLE；`中文分号、通道参数 ADC1 漏写等）：

```c
#include "stm32f10x.h"

void delay(u32 cnt) { while (cnt--); }

int main(void)
{
    ADC_InitTypeDef  ADC_InitStructure;
    GPIO_InitTypeDef GPIO_InitStructure;
    u16 dat;

    // 使能时钟
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA | RCC_APB2Periph_ADC1, ENABLE);
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOE, ENABLE);

    // LED 端口 PE 全部推挽输出
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_All;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOE, &GPIO_InitStructure);

    // ADC 时钟分频：72/6 = 12 MHz（不超过 14 MHz）
    RCC_ADCCLKConfig(RCC_PCLK2_Div6);
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_1;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AIN;   // PA1 模拟输入
    GPIO_Init(GPIOA, &GPIO_InitStructure);

    ADC_DeInit(ADC1);
    ADC_InitStructure.ADC_Mode = ADC_Mode_Independent;      // 独立模式
    ADC_InitStructure.ADC_ScanConvMode = DISABLE;           // 单通道
    ADC_InitStructure.ADC_ContinuousConvMode = DISABLE;     // 单次转换
    ADC_InitStructure.ADC_ExternalTrigConv = ADC_ExternalTrigConv_None; // 软件触发
    ADC_InitStructure.ADC_DataAlign = ADC_DataAlign_Right;  // 右对齐
    ADC_InitStructure.ADC_NbrOfChannel = 1;
    ADC_Init(ADC1, &ADC_InitStructure);

    ADC_RegularChannelConfig(ADC1, 1, 1, ADC_SampleTime_239_5Cycles5); // 通道1，239.5周期

    ADC_Cmd(ADC1, ENABLE);
    ADC_ResetCalibration(ADC1);
    while (ADC_GetResetCalibrationStatus(ADC1));
    ADC_StartCalibration(ADC1);
    while (ADC_GetCalibrationStatus(ADC1));

    while (1)
    {
        ADC_SoftwareStartConvCmd(ADC1, ENABLE);
        while (!ADC_GetFlagStatus(ADC1, ADC_FLAG_EOC)); // 等待转换结束
        dat = ADC_GetConversionValue(ADC1);
        GPIO_Write(GPIOE, dat);   // AD 值送 LED 显示
        delay(1000000);
    }
}
```

> **记忆点**：ADC 软件落地记住「11 步流水线」——开时钟 → 引脚模拟输入 → 配 ADCCLK → 复位 → `ADC_Init` → 配规则通道 → 使能 → 校准 → 启动 → 等 EOC → 读值。`ADC_InitTypeDef` 的 6 个成员决定了转换模式、触发、对齐与通道数。

---

## 六、DAC 的工作原理及性能指标

### 6.1 DAC 的工作原理

根据解码网络结构不同，DAC 可分为 T 形、倒 T 形、权电阻和权电流等类型；根据模拟电子开关种类不同，可分为 CMOS 型和双极型（双极型又分电流开关型和 ECL 电流开关型）。

以**权电阻型 DAC** 为例：把数字量二进制代码各位按其「权」的数值转换成相应电流，再把代表各位数值的电流相加。一个 8 位权电阻 DAC 用线性电阻网络（叠加原理可分析）：Di=0 时开关 Si 接地，Di=1 时 Si 接标准电压 V；逐个求出每个开关单独接通时的输出分量再相加，即得总输出电压。

### 6.2 DAC 的性能指标

1. **分辨率**：对输入量变化敏感程度的描述，与输入数字量位数有关；
2. **稳定时间**：代码满度变化时，输出稳定到 ±1/2 最低位相当范围所需时间，一般几十毫秒到几微秒；
3. **输出电平**：型号差异大，一般 5~10 V，高压输出型 24~30 V；电流输出型低至 20 mA、高至 3 A；
4. **转换精度**：转换后实际值对理想值的接近程度；
5. **输入编码**：二进制、BCD 码、双极性时的符号-数值码、补码、偏移二进制码等。

### 6.3 STM32 集成的 DAC 模块

STM32F103VET6 的 DAC 是 12 位数字输入、电压输出的数模转换器，可配置 8 位或 12 位，可与 DMA 配合；12 位模式下数据可左对齐或右对齐。有 2 个输出通道，各通道有独立转换器；双 DAC 模式下 2 通道可独立或同步更新输出；可通过引脚输入参考电压提高精度。

主要特征：2 个 DAC 转换器各对应 1 个输出通道；8 位或 12 位单调输出；12 位下左 / 右对齐；同步更新；噪声波形生成；三角波形生成；双通道同时或分别转换；每通道有 DMA；外部触发转换；输入参考电压 VREF+。

相关引脚：模拟电源 VDDA、模拟地 VSSA、高端参考正 VREF+、通道 x 模拟输出 DAC_OUTx。

> **记忆点**：本节补齐了模拟量链路的另一端——DAC。权电阻型是最易理解的结构（按权转电流再叠加）；5 项指标中分辨率、稳定时间、输出电平最关键；STM32 的 12 位双通道 DAC 还能生成噪声 / 三角波，是做波形发生器的硬件基础。

---

## 本章小结与思考题

**核心知识地图**：

1. ADC 的工作原理及性能指标（逐次逼近式 SAR、双积分式、13 项选型指标）；
2. STM32 的 ADC 概述（18 路 12 位、主要特性、相关引脚、ADCCLK ≤ 14 MHz）；
3. STM32 的 ADC 配置（开关控制、时钟、规则组 / 注入组通道选择、单次 / 连续 / 扫描 / 间断模式、模拟看门狗、注入通道管理）；
4. STM32 的 ADC 应用特征及中断请求（校准、数据对齐、采样时间 TCONV=采样+12.5 周期、外部触发、DMA、双 ADC 6 种模式、温度传感器、中断）；
5. STM32 的 ADC 寄存器及库函数（11 个寄存器及偏移、`ADC_InitTypeDef` 六成员、6 个函数、11 步工程流程与例 10-1）；
6. DAC 的工作原理及性能指标（权电阻型等结构、5 项指标、STM32 12 位双通道 DAC 模块）。

**思考练习题（覆盖考点）**：

1. 何为 ADC 和 DAC？STM32 中 ADC 和 DAC 各有多少个？
2. 请简述逐次逼近式模数转换器的工作原理和特点。
3. 什么是 ADC 的转换时间，如何对其进行设置和计算？
4. STM32 的 ADC 和 DAC 分别有哪些引脚，各有什么作用？
5. 什么是规则组和注入组？它们之间有什么区别？如何对各组的转换通道进行设置？
6. ADC1 和 ADC2 用于规则通道的外部触发源有哪些？
7. ADC 的中断请求有哪些？分别对应什么事件？
8. 请简述 ADC 模块的使用步骤。

---

> 本文由课程课件与讲稿整理，供学习交流使用。如需转载或用于教学，请注明出处。
