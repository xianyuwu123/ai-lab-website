# 微机原理与接口技术 · 第9章《串行通信》知识点全梳理

> 本文整理自福州大学《微机原理与接口技术》吴衔誉教授第九章课件，系统讲解通信的有关概念、STM32 的异步串行通信接口、USART 寄存器、USART 固件库函数、USART 使用举例以及 SPI 接口六大板块。

---

## 目录

- [一、通信的有关概念](#一通信的有关概念)
- [二、STM32 的异步串行通信接口](#二stm32-的异步串行通信接口)
- [三、STM32 的 USART 寄存器](#三stm32-的-usart-寄存器)
- [四、STM32 的 USART 固件库函数](#四stm32-的-usart-固件库函数)
- [五、STM32 的 USART 使用举例](#五stm32-的-usart-使用举例)
- [六、STM32 的 SPI 接口](#六stm32-的-spi-接口)
- [本章小结与思考题](#本章小结与思考题)

---

## 一、通信的有关概念

### 1.1 串行通信的有关概念

**什么是通信**：计算机的 CPU 与外部设备之间，以及计算机和计算机之间的信息交换。

**并行通信**：一次传送一个或一个以上字节（1 Byte = 8 bit）的数据，数据的各位同时进行传送；以字节或字节的倍数为传输单位。它适合外部设备与计算机之间近距离、大量、快速的信息交换（计算机内部总线就是以并行方式传输的）。特点是传输速度快，但距离较远、位数较多时，通信线路复杂且成本高。

**串行通信**：通信双方使用一根或两根数据信号线相连，数据在一根数据信号线上一位一位地顺序传送，每一位数据都占据一个固定的时间长度。与并行相比，优点是传输线少、成本低、适合远距离传送及易于扩展；缺点是速度慢、传输时间长。计算机上常用的 COM 设备、USB 设备和网络设备都采用串行通信。

两类通信的对比如下表：

| 对比项 | 并行通信 | 串行通信 |
| --- | --- | --- |
| 传送方式 | 一次传送一个或一个以上字节 | 数据在一根线上一位一位顺序传送 |
| 适用场景 | 近距离、大量、快速的交换；传输速度快 | 传输线少、成本低、适合远距离、易于扩展 |
| 缺点 | 距离远、位数多时线路复杂、成本高 | 速度慢、传输时间长 |

**（1）串行通信的分类**

**按串行数据的同步方式**，分为同步通信和异步通信两类。

- **异步通信（Asynchronous Communication）**：接收器和发送器使用各自的时钟，工作是非同步的（典型器件为 UART，Universal Asynchronous Receiver/Transmitter，通用异步收发器）。每一个字符要用起始位和停止位作为字符开始和结束的标志，以字符为单位逐个发送和接收。

  异步传送时每个字符的组成格式：首先用一个起始位（逻辑 0，低电平）表示字符开始；紧跟着是数据字，通常 7 位或 8 位（低位在前、高位在后），可根据需要加入奇偶校验位；最后是停止位（逻辑 1，高电平），长度可为 1 位、1.5 位或 2 位。数据字加上起始位和停止位就形成一个串行帧。字符间隔不固定，停止位后可加空闲位（高电平），用于等待发送，收发可随时进行。

- **同步通信（Synchronous Communication）**：要求收发双方具有同频同相的同步时钟信号（典型器件为 USART、SPI）。它是一种连续串行传送数据的通信方式，一次通信只传送一帧信息，帧中通常含有若干个数据字符。

  同步通信根据控制规程分为面向字符型和面向比特型：

  - 面向字符型可采用单同步、双同步、外同步三种格式。单 / 双同步由同步字符、数据字符和校验字符 CRC（Cyclic Redundancy Check，循环冗余校验）三部分组成；单同步先传一个同步字符 SYNC，双同步先传两个；
  - 外同步没有同步字符，用一条专用控制线传送同步信号；每帧结束时用两个字节的 CRC 结束；
  - 面向比特型（按 SDLC，Synchronous Data Link Control，同步数据链路控制规程）每帧由 6 部分组成：开始标志 7EH、1 字节地址场、1 字节控制场、任意位的数据段、2 字节 CRC、结束标志 7EH。为避免数据 / CRC 中出现 6 个连续 1 被误判为结束标志，发送端在连续出现 5 个 1 时立即插入一个 0，接收端再去掉。

  同步通信数据传输速率较高，通常可达 56000 bit/s 或更高，适合信息量大、速率高的系统；缺点是要求发送时钟和接收时钟严格同步，且发送时钟还要同时送到接收端。

**波特率与比特率**（异步 / 同步都涉及的速率概念）：

- **比特率**：数字信号的传输速率，用单位时间传输的二进制有效位数表示，单位 bit/s（bps）、Kbps 或 Mbps；
- **波特率**：数据信号对载波的调制速率，用单位时间载波调制状态改变次数表示，单位波特（Baud）；
- 二者关系：**比特率 = 波特率 × 单个调制状态对应的二进制位数**；
- 例：数据传送速率为 120 字符/秒，每个字符 10 位，则比特率 = 10 × 120 = 1200 bit/s。

> **辨析**：波特率（Baud，码元速率）与比特率（bit/s，位速率）不是一回事。工程上常说的「波特率 9600」严格来说是位速率；只有当每个码元只承载 1 位二进制时，二者数值才相等。考试中务必先看题目给的是「字符/秒」还是「比特/秒」。

**按数据传送方向**，串行通信分为单工、半双工和全双工 3 种。两点之间的传送方式有：

- **单工（Simplex）**：A 为发送站、B 为接收站，数据只能由 A 发至 B，不能反向。类似无线电广播；
- **半双工（Half Duplex）**：数据可从 A 到 B，也可从 B 到 A，但用一根线连接，同一时间只能一个方向传送，方向由收发控制开关控制。类似对讲机；
- **全双工（Full Duplex）**：分别用 2 根独立传输线连接收发双方，A、B 可同时发送和接收。类似电话机。

此外还有**主从多终端通信方式**：主机可向多个终端发信息，在主机允许下各终端在不同时间向主机发信息，又可分为多终端半双工和全双工。

**（2）串行接口**

串行通信中数据是一位一位传送的，而计算机中是并行传送的，因此需要串行接口完成并 → 串（发送）和串 → 并（接收）的转换。这种转换可用软件也可用硬件实现，为减轻 CPU 负担，通常用硬件（串行接口）完成。

串行接口主要由 4 部分组成：

- **数据输入寄存器**：串行数据一位一位进入接收移位寄存器，经串入并出转换，收完一个字符后送入数据输入缓冲器，等待 CPU 读取；
- **数据输出寄存器**：CPU 输出的数据先到输出缓冲器，再到发送移位寄存器，经并入串出转换后逐位送出；
- **状态寄存器**：存放外设运行状态信息，CPU 通过读它了解状态、进而控制外设；
- **控制寄存器**：存放 CPU 设置的工作方式命令和操作命令，控制外设运行。

**串行接口基本工作原理**：

- 发送：CPU 经数据总线把 8 位并行数据送到数据输出寄存器，再送并行输入 / 串行输出移位寄存器，在发送时钟和控制电路下逐位发送；起始位和停止位由接口自动添加；发完一帧产生中断请求，CPU 可送下一字符；
- 接收：接口监视接收端，检测到低电平（起始位）就开始接收；每收到一位使接收移位寄存器左移一次，收完一个字符后并行送入数据输入寄存器，并产生中断促使 CPU 取走。

**USART 与 UART**：USART（Universal Synchronous Asynchronous Receiver/Transmitter，通用同步 / 异步串行收发器）是一个全双工通用同步 / 异步串行收发模块，一般分为 3 部分：时钟发生器、数据发送器和接收器。UART 除没有同步时钟信号外，其余模块与 USART 相同。

UART 中设有 3 种出错标志：

1. **奇偶错误（PE，Parity error）**：发送时检查每个字符中 1 的个数，自动在奇偶校验位补 1 或 0，使含校验位的 1 总数在偶校验时为偶数、奇校验时为奇数；接收时重新计算校验，不符则置 PE；
2. **帧错误（FE，Frame error）**：字符格式不符合规定。若接收时钟与发送时钟频率相差太大，导致起始位后采样错位，使本应为高电平的停止位变成低电平，则置 FE；
3. **溢出错误（OE，Overrun error）**：UART 是双缓冲结构。若 CPU 迟迟不取走第一个字符，第二个字符进入缓冲器就会覆盖并丢失第一个字符，此时置 OE。

### 1.2 并行通信的有关概念

**（1）并行接口**

实现并行通信的接口电路。分类：输入并行接口、输出并行接口、输入 / 输出并行接口。并行通信以同步方式传输，特点是传输速度快、硬件开销大、适合近距离。与所有接口一样，并行接口信息传输包含状态信息（如 READY=1 表示输入准备好、BUSY=1 表示接口正忙）、控制信息（CPU 发出的工作方式 / 启动 / 复位命令）和数据信息。

**（2）并行接口电路组成**

通常由输入数据缓冲器、输出数据缓冲器、状态寄存器和控制寄存器组成。

- **输入缓冲寄存器**：接收设备送来的数据，CPU 通过读操作取走；
- **输出缓冲寄存器**：接收 CPU 送来的数据，设备空闲时取走；
- **状态寄存器**：存放外设运行状态，供 CPU 查询；
- **控制寄存器**：存放 CPU 设置的工作方式命令。

**（3）并行通信接口的基本输入 / 输出工作过程**

- **输入过程**：外设把并行数据放到数据总线上并使「数据输入准备好」选通信号有效，数据进入输入缓冲器；接口使「数据输入应答」有效作为响应；外设撤销输入数据和选通信号；接口在状态寄存器置「输入准备好」位（也可发中断请求）；CPU 用查询或中断方式读走数据后，接口清除该状态位并使数据总线高阻，传送结束；
- **输出过程**：外设取走数据后，接口置「输出准备好」状态位（也可发中断）；CPU 用查询或中断方式输出数据到输出缓冲器，接口清除该状态位并把数据送往外设、发「启动信号」；外设接收后发「数据输出应答」；接口重新置「输出准备好」位，等待下一个数。

> **记忆点**：本节是概念地基。记住 4 组对照——并行 vs 串行（线数 / 成本 / 距离）、同步 vs 异步（有无共用时钟、帧结构）、单工 / 半双工 / 全双工（方向能力），以及 UART 的 3 种错误标志（PE/FE/OE）。波特率与比特率的区分是高频考点，务必分清。

---

## 二、STM32 的异步串行通信接口

### 2.1 STM32 异步串行通信接口简介

STM32 集成了 3 个 USART（USART1~USART3）和 2 个 UART（UART4、UART5）。USART 提供一种灵活的方法与使用工业标准 NRZ（Non-return-to-zero Code，不归零编码）异步串行数据格式的外部设备做全双工数据交换；利用分数波特率发生器提供宽范围波特率选择，最高达 4.5 Mbit/s；支持同步单向通信、半双工单线通信、LIN（Local Interconnect Network，局部互连网）、智能卡协议、IrDA（Infrared Data Association，红外数据组织）SIR 规范、调制解调器（CTS/RTS）操作，以及多处理器通信；还可用多缓冲 DMA（Direct Memory Access，直接存储器访问）实现高速通信。

USART 主要特性：

- 全双工异步通信，NRZ 标准格式；
- 分数波特率发生器，最高 4.5 Mbit/s；
- 可编程数据字长度（8 位或 9 位）；
- 可配置停止位（1 或 2 个，另有 0.5/1.5 用于智能卡）；
- LIN 主机发同步断开符、从机检测断开符能力；
- 发送方为同步传输提供时钟；
- IrDA SIR 编解码器；
- 智能卡模拟（ISO7816-3）；
- 单线半双工通信；
- 可配置 DMA 多缓冲通信；
- 独立的发送器 / 接收器使能位；
- 检测标志：接收缓冲器满、发送缓冲器空、传输结束；
- 校验控制；
- 4 个错误检测标志：溢出、噪音、帧、校验；
- 10 个带标志的中断源；
- 多处理器通信（地址不匹配则进入静默模式），两种唤醒方式：地址位（第 9 位 MSB）或总线空闲。

### 2.2 STM32 的 USART 引脚重映射

通过软件设置复用重映射寄存器（AFIO_MAPR，Alternate Function I/O Remap Register，复用输入 / 输出重映射寄存器）中的 USART1_REMAP、USART2_REMAP 和 USART3_REMAP[1:0]，可以把 USART1~USART3 的功能引脚切换到备用引脚（功能引脚重映射）。

### 2.3 STM32 的 USART 接口结构

任何双向通信的 USART 至少通过 2 个引脚连接：接收数据输入（RX）和发送数据输出（TX）。

- **RX**：接收数据串行输入，通过过采样技术区分数据和噪音以恢复数据；
- **TX**：发送数据输出；发送器禁止时输出引脚恢复为 I/O 端口配置；发送器激活且不发送数据时，TX 处于高电平；单线 / 智能卡模式下该 I/O 同时用于收发。

USART 数据帧格式（异步）：总线空闲为高电平；一个起始位；一个数据字（8 或 9 位，LSB 在前）；0.5、1.5 或 2 个停止位标明帧结束；使用分数波特率发生器（12 位整数 + 4 位小数）；含状态寄存器（USART_SR）、数据寄存器（USART_DR）、波特率寄存器（USART_BRR，12 位整数 + 4 位小数）、保护时间寄存器（USART_GTPR）。

附加引脚（按需启用）：

- **同步模式**需要 CK（发送器时钟输出，类似 SPI 主模式）；
- **IrDA 模式**需要 IrDA_RDI（数据输入）、IrDA_TDO（数据输出）；
- **硬件流控制**需要 nCTS（清除发送，高电平时在当前数据结束时阻断下次发送）、nRTS（发送请求，低电平时表明 USART 准备好接收）。

### 2.4 STM32 的 USART 特性

**（1）数据格式**

通过 USART_CR1 的 M 位选择字长 8 或 9 位。起始位期间 TX 为低电平，停止位期间为高电平。空闲符号是全部由 1 组成的一整个数据帧（含停止位）；断开符号是在一个帧周期内全部为 0（含停止位），结束时发送器再插入 1 或 2 个停止位应答起始位。发送和接收由公用波特率发生器驱动。

**（2）发送器**

当发送使能位（TE）置位时，发送移位寄存器数据在 TX 输出，相应时钟在 CK 输出。字符发送时，TX 上先移出数据最低位；USART_DR 内含内部总线与发送移位寄存器之间的缓冲器（TDR）；每个字符前有一个低电平起始位，后可配 0.5/1/1.5/2 个停止位。

**字符发送配置步骤**：

1. 置位 USART_CR1 的 UE 位激活 USART；
2. 编程 USART_CR1 的 M 位定义字长；
3. 在 USART_CR2 中编程停止位数；
4. 多缓冲通信则配置 USART_CR3 的 DMAT 位并按 DMA 要求配置 DMA 寄存器；
5. 用 USART_BRR 选择要求波特率；
6. 置位 USART_CR1 的 TE 位，发送一个空闲帧作为首次发送；
7. 把待发数据写进 USART_DR（清除 TXE）；单缓冲时对每个数据重复此步；
8. 写最后一个数据字后，等待 TC=1（最后一帧传输结束），再关闭 USART 或进停机模式，避免破坏最后一次传输。

**单字节通信**：写 USART_DR 清零 TXE 位；TXE 置位表示数据已从 TDR 移到移位寄存器、TDR 已空、可写下一个数据；若 TXEIE 置位则产生中断。一帧发完且 TXE 置位时 TC 置位，若 TCIE 置位则产生中断。TC 清除步骤：先读 USART_SR，再写 USART_DR；也可软件写 0 清除（推荐仅用于多缓冲模式）。

**（3）接收器**

**起始位侦测**：辨认出一个特殊采样序列才认为收到起始位；若 3 个采样点全为 0 则确认起始位并置 RXNE（若 RXNEIE=1 则中断）；若两次 3 采样点仅 2 个为 0，起始位仍有效但置 NE 噪声标志；不满足则退出侦测回到空闲。

**字符接收配置步骤**：

1. 置位 USART_CR1 的 UE 激活 USART；
2. 编程 M 位定义字长；
3. 在 USART_CR2 编写停止位个数；
4. 多缓冲则选 USART_CR3 的 DMAR 并配置 DMA；
5. 用 USART_BRR 选波特率；
6. 置位 USART_CR1 的 RE 激活接收器，开始寻找起始位。

收到字符时：RXNE 置位（移位寄存器内容转到 RDR）；若 RXNEIE 置位则中断；若检测到帧 / 噪音 / 溢出错误则置相应标志；单缓冲模式下由软件读 USART_DR 清除 RXNE（也可写 0 清除），且必须在下一字符接收结束前清零以免溢出。断开符号按帧错误处理；空闲帧按普通帧处理（IDLEIE 置位则中断）。

**溢出错误**：若 RXNE 未复位又收到字符则发生溢出（ORE 置位）；RDR 内容不丢（读 USART_DR 仍能得先前数据），但移位寄存器被覆盖、随后数据丢失；顺序读 USART_SR 和 USART_DR 可复位 ORE。

**（4）分数波特率的产生**

收发波特率由 USARTDIV 的整数和小数寄存器值决定，公式（f_CK 为外设时钟，USART1 用 PCLK2，USART2/3/4/5 用 PCLK1）：

```
波特率 = f_CK / (16 × USARTDIV)
USARTDIV = DIV_Mantissa + DIV_Fraction / 16
```

USART_BRR 寄存器：高 12 位（位 15:4）为 DIV_Mantissa（整数），低 4 位（位 3:0）为 DIV_Fraction（小数）。写入 BRR 后波特率计数器被新值替换，因此通信进行中不要改 BRR。

例：若 USART_BRR = 0x1BC，则 DIV_Mantissa = 27、DIV_Fraction = 12，USARTDIV = 27 + 12/16 = 27.75。

**（5）多处理器通信**

多个 USART 可连成一个网络：某个 USART 作主，其 TX 接各从机 RX；从机 TX 逻辑或在一起接主机 RX。未被寻址的设备可启用静默功能（RWU 位置 1，任何接收状态位不置、所有接收中断禁止）减少服务开销。退出 / 进入静默模式由 WAKE 位决定：

- **WAKE=0（空闲总线检测）**：RWU 写 1 进入静默；检测到空闲帧时唤醒，RWU 硬件清零（此时 IDLE 位不置起）；
- **WAKE=1（地址标记检测）**：MSB 为 1 表示地址字节，否则为数据字节；地址字节中目标地址放 4 个 LSB，与接收器在 USART_CR2 的 ADD 中编程的地址比较。不匹配则进入静默（硬件置 RWU）；匹配则退出静默（RWU 清零），随后字节正常接收并置 RXNE。

**（6）校验控制**

置位 USART_CR1 的 PCE 位使能奇偶控制：发送时数据最高位被校验位替换后发出；接收校验失败则置 PE 标志或产生中断。

### 2.5 STM32 的 USART 中断请求

USART 的各种中断事件连接到同一个中断向量，可产生以下中断：

- 发送：发送完成、清除发送、发送数据寄存器空；
- 接收：空闲总线检测、溢出错误、接收数据寄存器非空、校验错误、LIN 断开符检测、噪音标志（仅多缓冲）、帧错误（仅多缓冲）。

> **记忆点**：本节是本章核心。USART 内部就是「波特率发生器 + 发送器（TDR/移位寄存器）+ 接收器（移位寄存器/RDR）+ 控制 / 状态寄存器」的组合。必须吃透：帧格式（起始 / 数据 / 停止）、发送与接收的 6~8 步配置、TXE/TC/RXNE 三个关键标志的含义与清除、分数波特率公式（BRR = 整数 + 小数/16），以及多处理器静默唤醒两种机制。

---

## 三、STM32 的 USART 寄存器

USART 寄存器起始地址：USART1 为 0x4001_3800，USART2 为 0x4000_4400，USART3 为 0x4000_4800，UART4 为 0x4000_4C00，UART5 为 0x4000_5000。高 16 位为保留位（强置 0），可用半字（16 位）或字（32 位）操作。7 个寄存器如下：

| 序号 | 寄存器 | 地址偏移 | 复位值 | 作用 |
| --- | --- | --- | --- | --- |
| 1 | USART_SR | 0x00 | 0x00C0 | 状态寄存器（TXE/TC/RXNE/错误标志等） |
| 2 | USART_DR | 0x04 | 不确定 | 数据寄存器（收 / 发共用） |
| 3 | USART_BRR | 0x08 | 0x0000 | 波特率寄存器（12 位整数 + 4 位小数） |
| 4 | USART_CR1 | 0x0C | 0x0000 | 控制寄存器 1（UE/TE/RE/M/PCE 等） |
| 5 | USART_CR2 | 0x10 | 0x0000 | 控制寄存器 2（停止位 / ADD 等） |
| 6 | USART_CR3 | 0x14 | 0x0000 | 控制寄存器 3（DMA / 硬件流控等） |
| 7 | USART_GTPR | 0x18 | 0x0000 | 保护时间和预分频寄存器（智能卡模式） |

---

## 四、STM32 的 USART 固件库函数

### 4.1 USART 寄存器结构与基地址

`USART_TypeDef` 在 `stm32f10x.h` 中定义，按 SR/DR/BRR/CR1/CR2/CR3/GTPR 顺序，中间穿插保留字（因 32 位对齐）。外设基地址声明：USART1 在 APB2（偏移 0x3800），USART2/3 在 APB1（偏移 0x4400/0x4800），并通过 `USART1`、`USART2`、`USART3` 指针访问。

### 4.2 常用的固件库函数

**（1）USART_Init**

```c
void USART_Init(USART_TypeDef* USARTx, USART_InitTypeDef* USART_InitStruct);
```

按 `USART_InitStruct` 初始化 USARTx（x 可为 1~3、UART4、UART5）。初始化结构体：

```c
typedef struct
{
    u32 USART_BaudRate;            // 波特率，如 9600、19200
    u16 USART_WordLength;          // 字长：USART_WordLength_8b / _9b
    u16 USART_StopBits;            // 停止位
    u16 USART_Parity;              // 奇偶校验
    u16 USART_Mode;                // 收发使能
    u16 USART_HardwareFlowControl; // 硬件流控制
} USART_InitTypeDef;
```

成员含义：

- **USART_BaudRate**：波特率，直接写 9600 等即可（库内按 `IntegerDivider = APBClock/(16*BaudRate)`、`FractionalDivider = (IntegerDivider − 取整)*16 + 0.5` 计算并填入 BRR）；
- **USART_WordLength**：`USART_WordLength_8b` 或 `_9b`；
- **USART_StopBits**：`_1`、`_0.5`、`_2`、`_1.5`；
- **USART_Parity**：`_No`（无）、`_Even`（偶）、`_Odd`（奇）；
- **USART_Mode**：`USART_Mode_Tx`、`USART_Mode_Rx`，可「或」组合；
- **USART_HardwareFlowControl**：`_None`、`_RTS`、`_CTS`、`_RTS_CTS`。

USART1 典型初始化：

```c
USART_InitStructure.USART_BaudRate = 9600;
USART_InitStructure.USART_WordLength = USART_WordLength_8b;
USART_InitStructure.USART_StopBits = USART_StopBits_1;
USART_InitStructure.USART_Parity = USART_Parity_No;
USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
USART_InitStructure.USART_Mode = USART_Mode_Rx | USART_Mode_Tx;
USART_Init(USART1, &USART_InitStructure);
```

**（2）USART_ITConfig**

```c
void USART_ITConfig(USART_TypeDef* USARTx, u16 USART_IT, FunctionalState NewState);
```

使能 / 除能指定 USART 中断。`USART_IT` 可取 `USART_IT_PE`、`USART_IT_TXE`、`USART_IT_TC`、`USART_IT_RXNE`、`USART_IT_IDLE`、`USART_IT_LBD`、`USART_IT_CTS`、`USART_IT_ERR` 的一个或多个组合。例：`USART_ITConfig(USART1, USART_IT_TXE | USART_IT_RXNE, ENABLE)`。

**（3）USART_Cmd**

```c
void USART_Cmd(USART_TypeDef* USARTx, FunctionalState NewState);
```

使能 / 除能 USART 外设。例：`USART_Cmd(USART1, ENABLE)`。

**（4）USART_SendData**

```c
void USART_SendData(USART_TypeDef* USARTx, u16 Data);
```

发送单个数据。例：`USART_SendData(USART1, 0x25);`

**（5）USART_ReceiveData**

```c
u16 USART_ReceiveData(USART_TypeDef* USARTx);
```

返回 USARTx 最近接收到的数据。例：`RxData = USART_ReceiveData(USART1);`

**（6）USART_GetFlagStatus**

```c
FlagStatus USART_GetFlagStatus(USART_TypeDef* USARTx, uint16_t USART_FLAG);
```

检查标志位（读 SR），返回 SET/RESET。`USART_FLAG` 可取 `USART_FLAG_CTS`、`USART_FLAG_LBD`、`USART_FLAG_TXE`、`USART_FLAG_TC`、`USART_FLAG_RXNE`、`USART_FLAG_IDLE`、`USART_FLAG_ORE`、`USART_FLAG_NE`、`USART_FLAG_FE`、`USART_FLAG_PE`。例：`USART_GetFlagStatus(USART1, USART_FLAG_TC)`。

**（7）USART_ClearFlag**

```c
void USART_ClearFlag(USART_TypeDef* USARTx, uint16_t USART_FLAG);
```

清除标志位。例：`USART_ClearFlag(USART1, USART_FLAG_TC)`。

**（8）USART_GetITStatus**

```c
ITStatus USART_GetITStatus(USART_TypeDef* USARTx, u16 USART_IT);
```

检查指定中断是否发生，返回 RESET/SET。例：`USART_GetITStatus(USART1, USART_IT_RXNE)`。

**（9）USART_ClearITPendingBit**

```c
void USART_ClearITPendingBit(USART_TypeDef* USARTx, u16 USART_IT);
```

清除中断待处理位。例：`USART_ClearITPendingBit(USART1, USART_IT_RXNE)`。

> **记忆点**：库函数把寄存器操作封装成「结构体 + 一组 API」。实际用串口只要记住一条主线：`USART_Init` 配参数 → `USART_ITConfig` 开中断 → `USART_Cmd` 使能 → 用 `USART_SendData`/`USART_ReceiveData` 收发、用 `USART_GetFlagStatus`/`GetITStatus` 查状态、`ClearFlag`/`ClearITPendingBit` 清标志。

---

## 五、STM32 的 USART 使用举例

USART 一般采用中断方式，步骤为：

1. 串口时钟使能（对应 GPIO 时钟也要使能）；
2. GPIO 端口模式设置：TX 设为 `GPIO_Mode_AF_PP`（复用推挽）、`GPIO_Speed_50MHz`；RX 设为 `GPIO_Mode_IN_FLOATING`（悬空输入）；
3. 调用 `USART_Init` 初始化（波特率、字长、校验、流控、收发使能）；
4. 调用 `USART_ITConfig` 开串口中断，调用 `NVIC_Init` 初始化 NVIC（Nested Vectored Interrupt Controller，嵌套向量中断控制器）；
5. `USART_Cmd` 使能串口；
6. 编写中断服务函数。

**例 9-1**：利用 STM32 最小系统板实现 STM32F103VET6 串口 1 与计算机串行通信。计算机通过串口助手发一个数据到 STM32，STM32 收到后按位取反回送。通信参数 9600, n, 8, 1（9600 波特、无校验、8 数据位、1 停止位）。

```c
#include "stm32f10x.h"

void NVIC_Config(void);

int main(void)
{
    GPIO_InitTypeDef  GPIO_InitStructure;
    USART_InitTypeDef USART_InitStructure;

    // 使能 PA 口和 USART1 时钟
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA |
                           RCC_APB2Periph_USART1, ENABLE);

    // 配置 USART1_TX (PA9) 复用推挽输出
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_9;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOA, &GPIO_InitStructure);

    // 配置 USART1_RX (PA10) 悬空输入
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_10;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING;
    GPIO_Init(GPIOA, &GPIO_InitStructure);

    // USART1 参数设置
    USART_InitStructure.USART_BaudRate = 9600;
    USART_InitStructure.USART_WordLength = USART_WordLength_8b;
    USART_InitStructure.USART_StopBits = USART_StopBits_1;
    USART_InitStructure.USART_Parity = USART_Parity_No;
    USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
    USART_InitStructure.USART_Mode = USART_Mode_Rx | USART_Mode_Tx;
    USART_Init(USART1, &USART_InitStructure);
    USART_Cmd(USART1, ENABLE);

    // 使能中断
    USART_ITConfig(USART1, USART_IT_RXNE, ENABLE);
    USART_ITConfig(USART1, USART_IT_TXE, ENABLE);
    USART_ClearITPendingBit(USART1, USART_IT_TC);
    NVIC_Config();

    while (1);
}

void NVIC_Config(void)
{
    NVIC_InitTypeDef NVIC_InitStructure;
    NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);
    NVIC_InitStructure.NVIC_IRQChannel = USART1_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);
}

void USART1_IRQHandler(void)
{
    u8 recdata;
    if (USART_GetITStatus(USART1, USART_IT_RXNE) != RESET)
    {
        recdata = USART_ReceiveData(USART1);    // 接收一个字节
        USART_SendData(USART1, ~recdata);       // 按位取反回送
    }
    if (USART_GetITStatus(USART1, USART_IT_TC) != RESET)
    {
        // 发送完成处理（此处留空）
    }
}
```

> 说明：课件原文在例 9-1 处代码分散在多页，且含一处笔误 `USART_WoedLength`（应为 `USART_WordLength`），上面已按 4.2 结构体定义校正并整合为完整可编译框架。

---

## 六、STM32 的 SPI 接口

SPI（Serial Peripheral Interface，串行外设接口）是一种同步串行接口技术，是一种高速、全双工、同步的通信总线。本章仅作引出，后续章节会展开其引脚、时钟极性与相位、数据传输等内容。

---

## 本章小结与思考题

**核心知识地图**：

1. 通信的有关概念（并行 vs 串行、同步 vs 异步、波特率与比特率、单工 / 半双工 / 全双工、串行接口 4 部分组成与工作原理、UART 三种错误标志、并行接口组成与输入输出过程）；
2. STM32 的异步串行通信接口（3 USART + 2 UART、引脚重映射、接口结构与帧格式、特性与收发配置、分数波特率、多处理器通信与静默唤醒、校验控制、中断请求）；
3. STM32 的 USART 寄存器（5 个端口起始地址、7 个寄存器及偏移）；
4. STM32 的 USART 固件库函数（`USART_TypeDef`、`USART_InitTypeDef` 六成员、9 个常用 API）；
5. STM32 的 USART 使用举例（中断方式 6 步、例 9-1 串口 1 回环取反）；
6. STM32 的 SPI 接口（高速全双工同步总线简介）。

**思考练习题（覆盖考点）**：

1. 什么是串行通信和并行通信？各自有什么优缺点。
2. 什么是异步通信和同步通信？各有什么特点？
3. 什么叫波特率？串行通信对波特率有什么基本要求？
4. 串行通信按数据传送方向来划分共有几种制式，相互间有什么区别？
5. 概述 STM32 微控制器 USART 的内部结构。
6. 简述 STM32 微控制器 USART 串口的配置步骤。
7. 已知异步通信接口帧格式由 1 个起始位、8 个数据位、无奇偶校验位和 1 位停止位组成。假设提供的时钟频率为 36 MHz，要求每分钟传送 3600 个字符，试计算其波特率，并确定寄存器 USART_BRR 的值。
   - 提示：3600 字符/分 = 60 字符/秒，每帧 10 位 ⇒ 波特率 = 60×10 = 600 bit/s；USARTDIV = 36000000/(16×600) = 3750 = 0x0EA6，故 USART_BRR = 0x0EA6（整数 3750、小数 0）。
8. 根据题 7 的相关内容对 USART1 进行配置，利用库函数编写 USART1 的初始化代码。
   - 提示：按 4.2 的 `USART_InitStructure` 填波特率 600、8 位、1 停止位、无校验、无流控、收发使能，再 `USART_Init(USART1, &USART_InitStructure)`。

---

> 本文由课程课件与讲稿整理，供学习交流使用。如需转载或用于教学，请注明出处。
