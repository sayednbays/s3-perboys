import React, { Component } from "react";
import { Input, List, ListItem, ListItemText, ListItemIcon } from 'material-ui';
import { Description } from 'material-ui-icons';
export default class MultipleFileInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            files: []
        };
    }
    onFilesSelected(e) {
        let uploadFiles = e.target.files;

        const files = [];
        let onFileLoadedFunc = (e) => {
            const fileData = e.target.result;
            files.push({ data: fileData, name: e.target.fileName });
            if (files.length === uploadFiles.length) {
                this.setState({ files: files });
                this.props.onChange && this.props.onChange(files);
            }
        };
        for (let i = 0; i < uploadFiles.length; i++) {
            let freader = new FileReader();
            freader.onload = onFileLoadedFunc;
            freader.fileName = uploadFiles[i].name;
            freader.readAsDataURL(uploadFiles[i]);
        }
    }
    render() {
        return (<div>
            <Input type='file' inputProps={{ multiple: true }} fullWidth
                onChange={this.onFilesSelected.bind(this)} />
            <List component="nav">
                {this.state.files.map(item => (
                    <ListItem>
                        <ListItemIcon>
                            <Description />
                        </ListItemIcon>
                        <ListItemText primary={item.name} />
                    </ListItem>
                ))}

            </List>
        </div>)
    }
}