import React, { Component } from 'react';
import { connect } from 'react-redux'
import {
    Typography, Input, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, AppBar, Toolbar, Grid, LinearProgress, Tooltip
} from 'material-ui';
import { GridListTile, GridList, GridListTileBar } from 'material-ui/GridList';
import { Folder, Description, FileUpload, Remove, CheckCircle, FileDownload } from 'material-ui-icons'
import { authActions, fileSystemActions } from '../actions';
import { MultipleFileInput } from '../components'
import './home.ui.css';

class HomeContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uploadDialogOpen: false, uploadFiles: [],
            folderCreateDialogOpen: false,
            folderName: '', error: null,
            selectedPaths: [],
            overOnPath: null
        };
    }
    componentWillMount() {
        const { dispatch } = this.props;
        dispatch(fileSystemActions.listContentsUnderPath('/'));
    }
    async logout() {
        const { dispatch } = this.props;
        await dispatch(authActions.logout());
    }
    navigateByPath(type, path) {
        const { dispatch } = this.props;
        if (type === 'folder') {
            dispatch(fileSystemActions.listContentsUnderPath(path));
        }
        else if (type === 'file') {
            dispatch(fileSystemActions.downloadFile(path));
        }
        this.setState({ selectedPaths: [] });
    }
    createFolder(path) {
        const { dispatch } = this.props;
        this.setState({ folderCreateDialogOpen: false, selectedPaths: [] });

        const { folderName } = this.state;
        if (!folderName) {
            this.setState({ error: 'folder name is required' });
            return;
        }
        dispatch(fileSystemActions.createFolder(path, folderName));
        this.setState({ error: null, folderName: '' });
    }
    deleteByPaths(paths) {
        const { dispatch } = this.props;
        dispatch(fileSystemActions.deletePaths(paths));
        this.setState({ error: null, uploadFiles: [] });
        this.setState({ selectedPaths: [] });
    }
    uploadFiles(path) {
        const { dispatch } = this.props;
        this.setState({ uploadDialogOpen: false, selectedPaths: [] });

        const { uploadFiles } = this.state;
        if (uploadFiles.length === 0) {
            this.setState({ error: 'file is required' });
            return;
        }

        dispatch(fileSystemActions.uploadFiles(path, uploadFiles));

    }
    onPathClicked(path) {
        const { selectedPaths } = this.state;
        let newSelectedPaths = [...selectedPaths];
        if (newSelectedPaths.indexOf(path) === -1) {
            newSelectedPaths.push(path);
        }
        else {
            newSelectedPaths = newSelectedPaths.filter(item => item !== path);
        }
        this.setState({ selectedPaths: newSelectedPaths });

    }
    render() {
        const { fileSystem, auth } = this.props;
        const { contents, curPath } = fileSystem;
        const userName = (auth.userData || {})['cognito:username'];

        let breadcrumbs = curPath.replace(/\/+$/g, '').split('/');

        return (
            <div className='home-container'>
                {(fileSystem.status === 'loading') ? <div className='loading-container'>
                    <LinearProgress color='accent' />
                </div> : null}
                <Grid justify='center' spacing={0} direction='column' container alignContent='center'>
                    <Grid item>
                        <AppBar position="static" color='primary'>
                            <Toolbar className='home-tool-bar'>
                                <div className='flex-spacer' />

                                <Typography type="body1" color="inherit" className='home-account-item'>{userName || ''}</Typography>
                                <Button dense color="contrast" onClick={this.logout.bind(this)}>Logout</Button>
                            </Toolbar>
                        </AppBar>
                    </Grid>
                    <Grid item>
                        <div className='home-path-breadcrumbs'>
                            {
                                breadcrumbs.map((item, index) => {
                                    let isLastIndex = index === breadcrumbs.length - 1;
                                    let crumb = item;
                                    let curItemPath = breadcrumbs.slice(0, index + 1).join('/') + '/';
                                    if (index === 0)
                                        crumb = 'Home';

                                    return (
                                        <div key={curItemPath} className='home-breadcrumb-container'>
                                            <Button classes={{ root: 'home-breadcrumb' }}
                                                disabled={isLastIndex} onClick={() => { this.navigateByPath('folder', curItemPath) }}>{crumb}</Button>
                                            {!isLastIndex && <span style={{ color: 'rgba(0,0,0,0.45)' }}>></span>}
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <Divider />
                        <Toolbar>
                            <div>
                                <Button style={{ marginRight: 30 }} onClick={() => { this.setState({ folderCreateDialogOpen: true }) }}
                                    title='Create Folder' raised color='primary'>
                                    <Folder />
                                    Create Folder</Button>
                                <Button style={{ marginRight: 30 }} onClick={() => { this.setState({ uploadDialogOpen: true }); }}
                                    title='Upload' raised color='primary'>
                                    <FileUpload />
                                    Upload Files</Button>
                                <Button style={{ marginRight: 30 }}
                                    disabled={this.state.selectedPaths.length === 0}
                                    onClick={() => { this.deleteByPaths(this.state.selectedPaths) }}
                                    raised color='primary'>
                                    <FileDownload />
                                    Download Files</Button>
                                <Tooltip placement="bottom" title="When remove folder, please make sure folder is empty">
                                    <div style={{ display: 'inline-block' }}>
                                        <Button
                                            disabled={this.state.selectedPaths.length === 0}
                                            onClick={() => { this.deleteByPaths(this.state.selectedPaths) }}
                                            raised color='accent'>
                                            <Remove />
                                            Remove folder/File
                                           </Button>
                                    </div>
                                </Tooltip>

                            </div>
                        </Toolbar>
                        <div className='home-grid-list-container'>
                            {
                                (fileSystem.error || this.state.error) &&
                                <Typography type="body2" color="error"
                                    className='home-account-item'>{fileSystem.error || this.state.error}</Typography>
                            }
                            <GridList cellHeight={100} className='home-grid-list' spacing={15} cols={5}>
                                {contents.map(item => {
                                    let segment = item.path.replace(/\/+$/g, '').split('/');
                                    let name = segment[segment.length - 1];
                                    let isPathSelected = this.state.selectedPaths.indexOf(item.path) >= 0;
                                    return (
                                        <GridListTile key={item.path} cols={1}>
                                            <div className={isPathSelected ? 'home-grid-item selected' : 'home-grid-item'}
                                                onClick={() => { this.navigateByPath(item.type, item.path) }}
                                                onMouseEnter={() => this.setState({ overOnPath: item.path })}
                                                onMouseLeave={() => this.setState({ overOnPath: null })}
                                            >
                                                {item.type === 'folder' ? <Folder classes={{ root: 'folder' }} /> : <Description classes={{ root: 'file' }} />}
                                                {(this.state.overOnPath === item.path || isPathSelected) &&
                                                    <div className='path-select'
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            this.onPathClicked(item.path)
                                                        }}>
                                                        <CheckCircle color={isPathSelected ? 'primary' : 'action'}
                                                            classes={{ colorAction: 'select-action-color' }} />
                                                    </div>
                                                }
                                           
                                            <GridListTileBar
                                                title={name}
                                                subtitle={item.size && <span>{Math.round(item.size / 1024) + 'KB'}</span>}
                                            />
                                             </div>
                                        </GridListTile>
                                    );
                                })}
                            </GridList>
                        </div>
                    </Grid>
                </Grid>

                <Dialog open={this.state.folderCreateDialogOpen}
                    ignoreBackdropClick
                    ignoreEscapeKeyUp
                    fullWidth
                    aria-labelledby="confirmation-dialog-title">
                    <DialogTitle id="confirmation-dialog-title">Folder Creation</DialogTitle>
                    <DialogContent>
                        <Input fullWidth value={this.state.folderName}
                            onChange={(event) => { this.setState({ folderName: event.currentTarget.value }) }}
                            placeholder='Folder Name' />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { this.setState({ folderCreateDialogOpen: false, folderName: '' }) }} color="default">
                            Cancel
          </Button>
                        <Button onClick={() => { this.createFolder(curPath) }} color="primary">
                            Ok
          </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={this.state.uploadDialogOpen}
                    ignoreBackdropClick
                    ignoreEscapeKeyUp
                    fullWidth
                    aria-labelledby="confirmation-dialog-title">
                    <DialogTitle id="confirmation-dialog-title">File Upload</DialogTitle>
                    <DialogContent>
                        <MultipleFileInput
                            onChange={(files) => { this.setState({ uploadFiles: files }) }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { this.setState({ uploadDialogOpen: false, uploadFiles: [] }) }} color="default">
                            Cancel
          </Button>
                        <Button onClick={() => { this.uploadFiles(curPath) }} color="primary">
                            Ok
          </Button>
                    </DialogActions>
                </Dialog>
            </div >
        )
    }
}

export default connect(
    (state) => ({
        fileSystem: state.fileSystem,
        auth: state.auth
    })
)(HomeContainer)
