import React, { useState } from 'react'
import ReportScreen from './screens/ReportScreen'
import SOSScreen from './screens/SOSScreen'
import HotlineScreen from './screens/HotlineScreen'

const Home = () => {
  const [activeTab, setActiveTab] = useState('report')

  const handleTabPress = (tab) => {
    setActiveTab(tab)
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'sos':
        return <SOSScreen onTabPress={handleTabPress} />
      case 'hotline':
        return <HotlineScreen onTabPress={handleTabPress} />
      case 'report':
      default:
        return <ReportScreen onTabPress={handleTabPress} />
    }
  }

  return renderScreen()
}

export default Home