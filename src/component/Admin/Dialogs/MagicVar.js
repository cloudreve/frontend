import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React from "react";

export default function MagicVar({ isFile, open, onClose, isSlave }) {
    const { t } = useTranslation();
    
    return (
      <Dialog
          open={open}
          onClose={onClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
      >
          <DialogTitle id="alert-dialog-title">
              {isFile ? t('File name magic variable') : t('Path Magic Variables')}
          </DialogTitle>
          <DialogContent>
              <TableContainer>
                  <Table size="small" aria-label="a dense table">
                      <TableHead>
                          <TableRow>
                              <TableCell>{t('Magic Variables')}</TableCell>
                              <TableCell>{t('describe')}</TableCell>
                              <TableCell>{t('Example')}</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{randomkey16}"}
                              </TableCell>
                              <TableCell>{t('16 random characters')}</TableCell>
                              <TableCell>N6IimT5XZP324ACK</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{randomkey8}"}
                              </TableCell>
                              <TableCell>{t('8 random characters')}</TableCell>
                              <TableCell>gWz78q30</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{timestamp}"}
                              </TableCell>
                              <TableCell>{t('Second timestamp')}</TableCell>
                              <TableCell>1582692933</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{timestamp_nano}"}
                              </TableCell>
                              <TableCell>{t('Nanosecond Timestamp')}</TableCell>
                              <TableCell>1582692933231834600</TableCell>
                          </TableRow>
                          {!isSlave && (
                              <TableRow>
                                  <TableCell component="th" scope="row">
                                      {"{uid}"}
                                  </TableCell>
                                  <TableCell>{t('User ID')}</TableCell>
                                  <TableCell>1</TableCell>
                              </TableRow>
                          )}
                          {isFile && (
                              <TableRow>
                                  <TableCell component="th" scope="row">
                                      {"{originname}"}
                                  </TableCell>
                                  <TableCell>{t('Original file name')}</TableCell>
                                  <TableCell>MyPico.mp4</TableCell>
                              </TableRow>
                          )}
                          {!isFile && !isSlave && (
                              <TableRow>
                                  <TableCell component="th" scope="row">
                                      {"{path}"}
                                  </TableCell>
                                  <TableCell>{t('User upload path')}</TableCell>
                                  <TableCell>{t('/My Files/Learning Materials/')}</TableCell>
                              </TableRow>
                          )}
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{date}"}
                              </TableCell>
                              <TableCell>{t('date')}</TableCell>
                              <TableCell>20060102</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{datetime}"}
                              </TableCell>
                              <TableCell>{t('Date Time')}</TableCell>
                              <TableCell>20060102150405</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{year}"}
                              </TableCell>
                              <TableCell>{t('years')}</TableCell>
                              <TableCell>2006</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{month}"}
                              </TableCell>
                              <TableCell>{t('month')}</TableCell>
                              <TableCell>01</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{day}"}
                              </TableCell>
                              <TableCell>{t('day')}</TableCell>
                              <TableCell>02</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{hour}"}
                              </TableCell>
                              <TableCell>{t('Hour')}</TableCell>
                              <TableCell>15</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{minute}"}
                              </TableCell>
                              <TableCell>{t('minute')}</TableCell>
                              <TableCell>04</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  {"{second}"}
                              </TableCell>
                              <TableCell>{t('Second')}</TableCell>
                              <TableCell>05</TableCell>
                          </TableRow>
                      </TableBody>
                  </Table>
              </TableContainer>
          </DialogContent>
          <DialogActions>
              <Button onClick={onClose} color="primary">
                {t('Close')}
              </Button>
          </DialogActions>
      </Dialog>
    );
}
