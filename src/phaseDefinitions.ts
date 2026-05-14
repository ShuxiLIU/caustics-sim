import type { PhaseFunctionDefinition } from './types'

export const phaseDefinitions: PhaseFunctionDefinition[] = [
  {
    id: 'polynomial',
    name: '多项式相位',
    expression: 'Φ(x,y) = a·x² + b·y² + c·xy + d·x',
    summary: '适合演示聚焦、像散以及一阶项对光束偏移的影响。',
    explanation:
      '这是当前默认的最小闭环模型，可直接用于观察相位分布、梯度与观察面图样之间的关系。',
    caveats: [
      '高阶项过大时会超出傍轴条件，后续阶段需要提示用户可信度下降。',
    ],
    params: [
      { key: 'a', label: '二次项 a', min: -0.2, max: 0.2, step: 0.01, value: 0.0 },
      { key: 'b', label: '二次项 b', min: -0.2, max: 0.2, step: 0.01, value: 0.0 },
      { key: 'c', label: '交叉项 c', min: -0.5, max: 0.5, step: 0.02, value: 0.0 },
      { key: 'd', label: '一次项 d', min: -0.2, max: 0.2, step: 0.01, value: 0.0 },
    ],
  },
  {
    id: 'airy',
    name: '艾里类三次相位',
    expression: 'Φ(x,y) = α·x³+β·y³',
    summary: '用于观察非对称三次相位导致的主瓣偏移与自加速趋势。',
    explanation:
      '该类型强调非线性相位斜率对传播方向场的影响，适合作为后续扩展相位类型。',
    caveats: [
      '真实艾里光束涉及波动光学解释；当前项目仅采用几何近似下的定性说明。',
    ],
    params: [
      { key: 'alpha', label: '三次项 α', min: -0.2, max: 0.2, step: 0.01, value: 0.0 },
      { key: 'beta', label: '三次项 β', min: -0.2, max: 0.2, step: 0.01, value: 0.0 },
    ],
  },
  {
    id: 'vortex',
    name: '涡旋相位',
    expression: 'Φ(x,y) = m·arctan(y/x)',
    summary: '用于展示相位奇点、环形结构与角向位相绕转。',
    explanation:
      '该模型在中心存在相位奇点，适合教学展示拓扑荷数的概念，但中心区域的结果通常只能做定性理解。',
    caveats: [
      '原点附近存在奇点，后续传播实现时需要单独处理采样稳定性。',
    ],
    params: [
      { key: 'm', label: '拓扑荷 m', min: -2, max: 4, step: 0.2, value: 0.0 },
    ],
  },
  {
    id: 'axicon',
    name: '锥面相位',
    expression: 'Φ(x,y) = α·√(x²+y²)',
    summary: '用于展示类贝塞尔结构的长焦区与轴向能量聚集趋势。',
    explanation:
      '这一类相位对应径向线性变化，适合与多项式相位进行对比，观察不同梯度场的焦散差异。',
    caveats: [
      '边缘区域的截断会显著影响结果，后续阶段需要加入采样口径控制。',
    ],
    params: [
      { key: 'alpha', label: '锥角 α', min: -0.5, max: 0.5, step: 0.01, value: 0.0 },
    ],
  },
  {
    id: 'noise',
    name: '平滑噪声相位',
    expression: 'Φ(x,y) = noise(x,y;f,A)',
    summary: '用于模拟具有空间相关性的复杂相位扰动，如水面波纹或粗糙相位屏。',
    explanation:
      '该类型更贴近日常焦散现象，但要保持物理一致性，后续阶段必须明确它表示的是相位扰动，而不是随机玻璃厚度本身。',
    caveats: [
      '噪声模型需要控制相关长度，否则结果会偏离傍轴近似的适用范围。',
    ],
    params: [
      { key: 'frequency', label: '频率 f', min: 1, max: 20, step: 1, value: 10 },
      { key: 'amplitude', label: '振幅 A', min: 0, max: 0.3, step: 0.01, value: 0.0 },
    ],
  },
]