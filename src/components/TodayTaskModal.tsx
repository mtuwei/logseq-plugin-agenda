import { todayTasksAtom } from '@/model/events'
import { getBlockData } from '@/util/logseq'
import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { Modal, Checkbox, Divider, Row, Col } from 'antd'
import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'

const TodayTaskModal: React.FC<{
  visible: boolean
  uuid: string
  onSave: () => void
  onCancel: () => void
}> = ({ visible, uuid, onSave, onCancel }) => {
  const [indeterminate, setIndeterminate] = useState(false)
  const [tasks] = useAtom(todayTasksAtom)

  const options = tasks.map((task) => ({
    label: task.addOns.showTitle,
    value: task.uuid,
  }))
  const [value, setValue] = useState<string[]>([])

  const onClickCheckAll = () => {
    if (options.length === value.length) {
      setValue([])
    } else {
      setValue(options.map(option => option.value))
    }
  }
  const onClickOk = async () => {
    let blockList: BlockEntity[] = []
    for (let i = 0; i < value.length; i++) {
      const block = await getBlockData({ uuid: value[i]?.replace('overdue-', '') })
      blockList.push(block)
    }
    logseq.Editor.insertBatchBlock(
      uuid,
      blockList.map((block) => ({
        content: `((${block?.uuid}))`,
      })),
      {
        before: false,
        sibling: true,
      }
    )
    onSave()
  }


  useEffect(() => {
    if (value?.length > 0 && value.length < options.length) {
      setIndeterminate(true)
    } else {
      setIndeterminate(false)
    }
  }, [value?.length, options?.length])

  console.log('[faiz:] === options', options, tasks, uuid)

  return (
    <Modal
      visible={visible}
      title="Insert Today Task"
      onCancel={onCancel}
      onOk={onClickOk}
    >
      <Checkbox.Group value={value} onChange={list => setValue(list as string[])}>
        {options.map((option, index) => (
          <Row>
            <Col span={24}>
              <Checkbox key={option.value} value={option.value}>{option.label}</Checkbox>
            </Col>
          </Row>
        ))}
      </Checkbox.Group>
      <Divider />
      <Checkbox
        indeterminate={indeterminate}
        checked={options.length === value.length}
        onClick={onClickCheckAll}
      >
        Check All
      </Checkbox>
    </Modal>
  )
}

export default TodayTaskModal