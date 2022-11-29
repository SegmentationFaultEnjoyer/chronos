import { TextField } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker, DateTimePickerTabs } from '@mui/x-date-pickers/DateTimePicker';

const CustomTabs = (props) => {
    <DateTimePickerTabs {...props} />
}

export default function BasicDateTimePicker({ label, value, setValue, minDateTime }) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                renderInput={(props) => <TextField {...props} />}
                label={label}
                value={value}
                onChange={(newValue) => {
                    setValue(newValue);
                }}
                minDateTime={minDateTime}
                components={{ Tabs: CustomTabs }}
                views={['day', 'hours']}
            />
        </LocalizationProvider>
    );
}