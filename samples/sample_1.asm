.data
var1: .word 0x1, 256

.text
main: LW t0, 4(x0)
      LW t1, 0(x0)
      SLL x31, t0, t1
L0:   SLLI t1, t1, 0x1
      SW t1, 0(x0)
      SLT t2, t1, t0
      BEQ t2, x0, L1
      BEQ x0, x0, L0
L1:   SLLI x0, x0, 0x0
