import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import ColorBy from 'auspice/src/components/controls/color-by'
import ChooseBranchLabelling from 'auspice/src/components/controls/choose-branch-labelling'
import ChooseLayout from 'auspice/src/components/controls/choose-layout'
import ChooseMetric from 'auspice/src/components/controls/choose-metric'
import SearchStrains from 'auspice/src/components/controls/search'
import { SidebarHeader } from 'auspice/src/components/controls/styles'

import { LogoPoweredByAuspice } from 'src/components/Tree/LogoPoweredByAuspice'

export const StyledAuspiceControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 15px;
`

export const SidebarHeaderStyled = styled(SidebarHeader)`
  margin-top: 2rem;
`

export const Bottom = styled.div`
  margin-top: auto;
`

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <StyledAuspiceControlsContainer>
      <SidebarHeaderStyled>{t('sidebar:Color By')}</SidebarHeaderStyled>
      <ColorBy />

      <SidebarHeaderStyled>{t('sidebar:Tree Options')}</SidebarHeaderStyled>
      <ChooseLayout />
      <ChooseMetric />
      <ChooseBranchLabelling />
      <SearchStrains />

      <Bottom>
        <LogoPoweredByAuspice />
      </Bottom>
    </StyledAuspiceControlsContainer>
  )
}

export default Sidebar
