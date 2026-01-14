'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Clock, Save, Loader2, Award } from 'lucide-react';
import { getSettings, updateSettings, Settings } from '@/services/BidSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { TimePicker } from '@/components/Reusable/TimePicker';

const DEFAULT_LD_TIMES = ['00:00', '12:00', '16:00', '20:00'];
const DEFAULT_JP_TIME = '20:00';

const BidSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Settings>>({});
  const [activeSection, setActiveSection] = useState<'common' | 'lucky' | 'jackpot'>('common');
  const [ldTimes, setLdTimes] = useState<string[]>(DEFAULT_LD_TIMES);
  const [jpTime, setJpTime] = useState<string>(DEFAULT_JP_TIME);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Helper function to format time to HH:mm (remove seconds if present)
  const formatTimeToHHMM = (time: string): string => {
    if (!time) return '00:00';
    // If time has seconds (HH:mm:ss), remove them
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      
      // Normalize numeric fields that might come as strings from API
      const normalizedData = {
        ...data,
        slotAutoGenerateCount: Number(data.slotAutoGenerateCount) || 0,
        defaultCommissionPct: Number(data.defaultCommissionPct) || 0,
        agentNegativeBalanceLimt: Number(data.agentNegativeBalanceLimt) || 0,
        bidPrizeLD: Number(data.bidPrizeLD) || 0,
        bidPrizeJP: Number(data.bidPrizeJP) || 0,
        minProfitPct: Number(data.minProfitPct) || 0,
        winningPrizeLD: Number(data.winningPrizeLD) || 0,
        winningPrizeJP: Number(data.winningPrizeJP) || 0,
      };
      
      setFormData(normalizedData);
      
      // Initialize LD times (ensure we have exactly 4 slots with defaults)
      const ldTimesData = data.defaultLdTimes || [];
      setLdTimes([
        formatTimeToHHMM(ldTimesData[0] || DEFAULT_LD_TIMES[0]),
        formatTimeToHHMM(ldTimesData[1] || DEFAULT_LD_TIMES[1]),
        formatTimeToHHMM(ldTimesData[2] || DEFAULT_LD_TIMES[2]),
        formatTimeToHHMM(ldTimesData[3] || DEFAULT_LD_TIMES[3]),
      ]);
      
      // Initialize JP time (only 1 slot with default)
      setJpTime(formatTimeToHHMM(data.defaultJpTimes?.[0] || DEFAULT_JP_TIME));
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Settings, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLdTimeChange = (index: number, value: string) => {
    setLdTimes(prev => {
      const newTimes = [...prev];
      newTimes[index] = formatTimeToHHMM(value);
      return newTimes;
    });
  };

  const handleJpTimeChange = (value: string) => {
    setJpTime(formatTimeToHHMM(value));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data with proper numeric conversions
      const updatedData = {
        slotAutoGenerateCount: Number(formData.slotAutoGenerateCount) || 0,
        timezone: formData.timezone || '',
        defaultCommissionPct: Number(formData.defaultCommissionPct) || 0,
        agentNegativeBalanceLimt: Number(formData.agentNegativeBalanceLimt) || 0,
        bidPrizeLD: Number(formData.bidPrizeLD) || 0,
        bidPrizeJP: Number(formData.bidPrizeJP) || 0,
        minProfitPct: Number(formData.minProfitPct) || 0,
        winningPrizeLD: Number(formData.winningPrizeLD) || 0,
        winningPrizeJP: Number(formData.winningPrizeJP) || 0,
        defaultLdTimes: ldTimes,
        defaultJpTimes: [jpTime],
      };
      
      console.log('Sending update:', updatedData);
      
      await updateSettings(updatedData);
      toast.success('Settings updated successfully');
      await fetchSettings();
    } catch (error: any) {
      console.error('Update error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update settings';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Bid Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Configure lottery system settings, prizes, and commissions
                </p>
              </div>
            </div>
            
            {/* Toggle Buttons */}
            <div className="border-2 border-primary rounded-full overflow-hidden shadow-lg flex p-1 bg-white">
              <button
                onClick={() => setActiveSection('common')}
                className={`font-bold px-6 py-1 text-lg transition-all duration-300 ${
                  activeSection === 'common'
                    ? 'bg-primary rounded-full text-white'
                    : 'bg-white text-primary'
                }`}
              >
                Common
              </button>
              <button
                onClick={() => setActiveSection('lucky')}
                className={`font-bold px-6 py-1 text-lg transition-all duration-300 ${
                  activeSection === 'lucky'
                    ? 'bg-primary rounded-full text-white'
                    : 'bg-white text-primary'
                }`}
              >
                Lucky Draw
              </button>
              <button
                onClick={() => setActiveSection('jackpot')}
                className={`font-bold px-6 py-1 text-lg transition-all duration-300 ${
                  activeSection === 'jackpot'
                    ? 'bg-primary rounded-full text-white'
                    : 'bg-white text-primary'
                }`}
              >
                Jackpot
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Common Settings */}
          {activeSection === 'common' && (
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Common Settings</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Basic system configuration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="slotAutoGenerateCount" className="text-sm font-medium">
                  Slot Auto Generate Count
                </Label>
                <Input
                  id="slotAutoGenerateCount"
                  type="number"
                  value={formData.slotAutoGenerateCount || ''}
                  onChange={(e) => handleInputChange('slotAutoGenerateCount', parseInt(e.target.value))}
                  className="h-11"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="timezone" className="text-sm font-medium">
                  Timezone
                </Label>
                <Input
                  id="timezone"
                  type="text"
                  value={formData.timezone || ''}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  placeholder="e.g., Asia/Manila"
                  className="h-11"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="minProfitPct" className="text-sm font-medium">
                  Min Profit (%)
                </Label>
                <Input
                  id="minProfitPct"
                  type="text"
                  value={formData.minProfitPct || ''}
                  onChange={(e) => handleInputChange('minProfitPct', e.target.value)}
                  placeholder="e.g., Asia/Manila"
                  className="h-11"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="defaultCommissionPct" className="text-sm font-medium">
                  Default Commission (%)
                </Label>
                <Input
                  id="defaultCommissionPct"
                  type="number"
                  step="0.01"
                  value={formData.defaultCommissionPct || ''}
                  onChange={(e) => handleInputChange('defaultCommissionPct', parseFloat(e.target.value))}
                  className="h-11"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="agentNegativeBalanceLimt" className="text-sm font-medium">
                  Agent Negative Balance Limit
                </Label>
                <Input
                  id="agentNegativeBalanceLimt"
                  type="number"
                  value={formData.agentNegativeBalanceLimt || ''}
                  onChange={(e) => handleInputChange('agentNegativeBalanceLimt', parseFloat(e.target.value))}
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>
          )}

          {/* Lucky Draw Settings */}
          {activeSection === 'lucky' && (
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Lucky Draw Settings</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Configure Lucky Draw times and prizes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Default LD Times (4 time slots)
                </Label>
                <div className="flex flex-wrap gap-3">
                  {ldTimes.map((time, index) => (
                    <TimePicker
                      key={index}
                      value={time}
                      onChange={(newTime) => handleLdTimeChange(index, newTime)}
                      label={`Time Slot ${index + 1}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click on a time slot to edit
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="bidPrizeLD" className="text-sm font-medium">
                    Bid Prize LD
                  </Label>
                  <Input
                    id="bidPrizeLD"
                    type="number"
                    step="0.01"
                    value={formData.bidPrizeLD || ''}
                    onChange={(e) => handleInputChange('bidPrizeLD', parseFloat(e.target.value))}
                    className="h-11"
                  />
                </div>
               
                <div className="space-y-2.5">
                  <Label htmlFor="winningPrizeLD" className="text-sm font-medium">
                    Winning Prize LD
                  </Label>
                  <Input
                    id="winningPrizeLD"
                    type="number"
                    step="0.01"
                    value={formData.winningPrizeLD || ''}
                    onChange={(e) => handleInputChange('winningPrizeLD', parseFloat(e.target.value))}
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Jackpot Settings */}
          {activeSection === 'jackpot' && (
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Jackpot Settings</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Configure Jackpot times and prizes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Default JP Time (1 time slot)
                </Label>
                <div className="flex flex-wrap gap-3">
                  <TimePicker
                    value={jpTime}
                    onChange={handleJpTimeChange}
                    label="Jackpot Time"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Click on the time slot to edit
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="bidPrizeJP" className="text-sm font-medium">
                  Bid Prize JP
                </Label>
                <Input
                  id="bidPrizeJP"
                  type="number"
                  step="0.01"
                  value={formData.bidPrizeJP || ''}
                  onChange={(e) => handleInputChange('bidPrizeJP', parseFloat(e.target.value))}
                  className="h-11"
                />
              </div>
                <div className="space-y-2.5">
                  <Label htmlFor="winningPrizeJP" className="text-sm font-medium">
                    Winning Prize JP
                  </Label>
                  <Input
                    id="winningPrizeJP"
                    type="number"
                    step="0.01"
                    value={formData.winningPrizeJP || ''}
                    onChange={(e) => handleInputChange('winningPrizeJP', parseFloat(e.target.value))}
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="min-w-[180px] cursor-pointer h-12 text-base shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidSettingsPage;
